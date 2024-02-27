import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { calculateIRV, IRVResult, PositionName } from './irv';

const app = express();
const PORT = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    // Initialize structure to hold segregated votes for each position
    const votesByPosition: { [key: string]: string[][] } = {};

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
            // Exclude the 'Submission ID' or any non-vote related columns
            const { 'Submission ID (Voter)': _, ...voteColumns } = row;

            Object.entries(voteColumns).forEach(([header, choice]) => {
                if (choice) {
                    // Extract the position name from the header
                    const positionMatch = header.match(/^(.*?) choice/);
                    if (positionMatch) {
                        const position = positionMatch[1];
                        if (!votesByPosition[position]) {
                            votesByPosition[position] = [];
                        }
                        // Ensure there's an array for the current voter (row)
                        if (!votesByPosition[position][row['Submission ID (Voter)']]) {
                            votesByPosition[position][row['Submission ID (Voter)']] = [];
                        }
                        votesByPosition[position][row['Submission ID (Voter)']].push(choice as string);
                    }
                }
            });
        })
        .on('end', () => {
            // Process IRV calculations for each position
            const results: Partial<Record<PositionName, IRVResult>> = {};

            Object.entries(votesByPosition).forEach(([position, votesArray]) => {
                // Filter out empty entries created due to direct indexing by Submission ID
                const filteredVotes = votesArray.filter(vote => vote !== undefined);
                if (Object.values(PositionName).includes(position as PositionName)) {
                    results[position as PositionName] = calculateIRV(filteredVotes, position as PositionName);
                }
            });

            fs.unlink(filePath, err => {
                if (err) {
                    console.error('Failed to delete the file:', err);
                    return res.status(500).json({ error: 'Failed to delete the uploaded file after processing.' });
                }
                res.json(results);
            });
        })
        .on('error', error => {
            console.error('Error processing file:', error);
            fs.unlink(filePath, err => {
                if (err) console.error('Failed to delete the file:', err);
                res.status(500).json({ error: 'Error processing file.' });
            });
        });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

