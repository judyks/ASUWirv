"use strict";
// import express from 'express';
// import multer from 'multer';
// import fs from 'fs';
// import path from 'path';
// import csvParser from 'csv-parser';
// import { calculateIRV, Vote, IRVResult } from './irv';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const app = express();
// const PORT = 3000;
// const upload = multer({ dest: 'uploads/' });
// app.use(express.static('public'));
// app.post('/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: 'No file uploaded.' });
//     }
//     const filePath = req.file.path;
//     const votes: Vote[] = [];
//     fs.createReadStream(filePath)
//         .pipe(csvParser())
//         .on('data', (data) => {
//             const vote: Vote = Object.values(data).filter(Boolean).map(String);
//             votes.push(vote);
//         })
//         .on('end', () => {
//             const position = "Position Name"; // Placeholder
//             const irvResult: IRVResult = calculateIRV(votes, position);
//             // Attempt to delete the file
//             fs.unlink(filePath, (err) => {
//                 if (err) {
//                     console.error('Failed to delete the file:', err);
//                     return res.status(500).json({ error: 'Failed to delete the uploaded file after processing.' });
//                 }
//                 res.json(irvResult);
//             });
//         })
//         .on('error', (error) => {
//             console.error('Error processing file:', error);
//             fs.unlink(filePath, (err) => {
//                 if (err) {
//                     console.error('Failed to delete the file after processing error:', err);
//                 }
//                 res.status(500).json({ error: 'Error processing file.' });
//             });
//         });
// });
// app.listen(PORT, () => {
//     console.log(`Server listening on http://localhost:${PORT}`);
// });
// index.ts
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
    const votes = [];
    fs_1.default.createReadStream(req.file.path)
        .pipe((0, csv_parser_1.default)())
        .on('data', (data) => {
        const vote = Object.values(data).filter(Boolean).map(String);
        votes.push(vote);
    })
        .on('end', () => {
        // Example: Calculate IRV for a specific position
        // You may need to adjust logic here to handle multiple positions
        const position = irv_1.PositionName.President; // Example position
        const irvResult = (0, irv_1.calculateIRV)(votes, position);
        if (req.file) {
            fs_1.default.unlink(filePath, (err) => {
                if (err) {
                    console.error('Failed to delete the file:', err);
                    // Consider how to handle this error. Maybe log it or send an error response.
                }
                // Proceed to send response here to ensure it's sent regardless of file deletion success
                res.json(irvResult); // Send IRV calculation results back to client
            });
        }
        else {
            // Directly respond if for some reason req.file is undefined at this point
            res.json(irvResult);
        }
    })
        .on('error', (error) => {
        console.error('Error processing file:', error);
        // Asynchronous file deletion with check for req.file
        if (req.file) {
            fs_1.default.unlink(filePath, (err) => {
                if (err) {
                    console.error('Failed to delete the file after error:', err);
                }
                // Send error response after attempting to delete the file
                res.status(500).json({ error: 'Error processing file.' });
            });
        }
        else {
            // Send error if req.file is undefined 
            res.status(500).json({ error: 'Error processing file.' });
        }
    });
});
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
