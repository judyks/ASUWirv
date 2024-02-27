"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const irv_1 = require("./irv");
const app = (0, express_1.default)();
const PORT = 3000;
const upload = (0, multer_1.default)({ dest: 'uploads/' });
app.use(express_1.default.static('public'));
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const filePath = req.file.path;
    // Initialize structure to hold segregated votes for each position
    const votesByPosition = {};
    fs_1.default.createReadStream(filePath)
        .pipe((0, csv_parser_1.default)())
        .on('data', (row) => {
        // Exclude the 'Submission ID' or any non-vote related columns
        const { 'Submission ID (Voter)': _ } = row, voteColumns = __rest(row, ['Submission ID (Voter)']);
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
                    votesByPosition[position][row['Submission ID (Voter)']].push(choice);
                }
            }
        });
    })
        .on('end', () => {
        // Process IRV calculations for each position
        const results = {};
        Object.entries(votesByPosition).forEach(([position, votesArray]) => {
            // Filter out empty entries created due to direct indexing by Submission ID
            const filteredVotes = votesArray.filter(vote => vote !== undefined);
            if (Object.values(irv_1.PositionName).includes(position)) {
                results[position] = (0, irv_1.calculateIRV)(filteredVotes, position);
            }
        });
        fs_1.default.unlink(filePath, err => {
            if (err) {
                console.error('Failed to delete the file:', err);
                return res.status(500).json({ error: 'Failed to delete the uploaded file after processing.' });
            }
            res.json(results);
        });
    })
        .on('error', error => {
        console.error('Error processing file:', error);
        fs_1.default.unlink(filePath, err => {
            if (err)
                console.error('Failed to delete the file:', err);
            res.status(500).json({ error: 'Error processing file.' });
        });
    });
});
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
