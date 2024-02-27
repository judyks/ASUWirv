
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import csvParser from 'csv-parser';
import { calculateIRV, Vote, PositionName } from './irv';

const app = express();
const PORT = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const filePath = req.file.path;
    const votes: Vote[] = [];

    fs.createReadStream(req.file.path)
       .pipe(csvParser())
       .on('data', (data) => {
           const vote: Vote = Object.values(data).filter(Boolean).map(String);
           votes.push(vote);
       })
       .on('end', () => {
           // Calculate IRV for a specific position
           // TODO:adjust logic here to handle multiple positions
           const position = PositionName.President; // Example position (TEMPORARY)
           const irvResult = calculateIRV(votes, position);

           if (req.file) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Failed to delete the file:', err);
                    // Consider how to handle this error. Maybe log it or send an error response.
                }
                // Proceed to send response here to ensure it's sent regardless of file deletion success
                res.json(irvResult); // Send IRV calculation results back to client
            });
        } else {
            // Directly respond if for some reason req.file is undefined at this point
            res.json(irvResult);
        }
    })
       .on('error', (error) => {
        console.error('Error processing file:', error);
        // Asynchronous file deletion with check for req.file
        if (req.file) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Failed to delete the file after error:', err);
                }
                // Send error response after attempting to delete the file
                res.status(500).json({ error: 'Error processing file.' });
            });
        } else {
            // Send error if req.file is undefined 
            res.status(500).json({ error: 'Error processing file.' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
