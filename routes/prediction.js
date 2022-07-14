import express from 'express';
import { spawn } from 'child_process';

const router = express.Router();

router.post('/create', async (req, res) => {
  const pythonProcess = spawn('python', [
    'prediction.py',
    req.body.predictAttr,
  ]);

  pythonProcess.stdout.on('data', (data) => {
    const output = JSON.parse(data.toString());

    return res.status(200).json({ data: output });
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0)
      return res
        .status(500)
        .json({ message: 'Something went wrong on prediction' });
    res.end();
  });
});

export default router;
