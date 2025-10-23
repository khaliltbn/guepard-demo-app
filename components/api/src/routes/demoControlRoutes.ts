import { Router } from 'express';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

const apiDir = process.cwd();
const projectRootDir = path.resolve(apiDir, '../../');
const demoDir = path.resolve(projectRootDir, 'demo');
const backendEnvPath = path.resolve(apiDir, '.env');
const demoManagerScriptPath = path.resolve(demoDir, 'demo-manager.sh');

const runScript = (command: string, cwd: string = projectRootDir): string => {
  try {
    const output = execSync(command, { cwd: cwd, stdio: 'pipe', encoding: 'utf8' });
    return output;
  } catch (error: any) {
    console.error(`Script execution failed: ${command}`, error.message);
    throw new Error(error.stderr?.toString() || error.message || 'Script execution failed');
  }
};


// --- ENDPOINTS ---

// GET /api/demo-control/status - Reads both URLs
router.get('/status', (req, res) => {
  try {
    let dbUrl = 'Not Found in .env';
    let shadowDbUrl = 'Not Found in .env';
    let dbName = 'Unknown';

    if (fs.existsSync(backendEnvPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(backendEnvPath));
        dbUrl = envConfig.DATABASE_URL || 'Not Found in .env';
        shadowDbUrl = envConfig.SHADOW_DATABASE_URL || 'Not Found or Not Set';

        try {
            const urlParts = new URL(dbUrl);
            dbName = `Connected to ${urlParts.hostname}:${urlParts.port} (DB: ${urlParts.pathname.substring(1)})`;
        } catch {
            dbName = `Could not parse Main URL (${dbUrl === 'Not Found in .env' ? 'URL missing' : 'Invalid format'})`;
        }
    } else {
         dbName = `.env file not found at ${backendEnvPath}`;
    }

    res.json({
      currentDatabase: dbName,
      rawDbUrl: dbUrl,
      rawShadowDbUrl: shadowDbUrl
    });
  } catch (error: any) {
    console.error("Failed to read .env for status:", error);
    res.status(500).json({ error: 'Could not read or parse .env file.', details: error.message });
  }
});

router.get('/feature-status/:featureName', (req, res) => {
    const featureName = req.params.featureName;
    if (!featureName) {
        return res.status(400).json({ error: 'Missing featureName in URL path.' });
    }

    const markerFilePath = path.resolve(apiDir, 'feature_applied');
    let isApplied = false;
    
    try {
        if (fs.existsSync(markerFilePath)) {
            isApplied = true;
        }
        res.json({ featureName: featureName, isApplied: isApplied });
    } catch (error: any) {
        console.error(`Error checking feature status for ${featureName}:`, error);
        res.status(500).json({ error: 'Failed to check feature status.', details: error.message });
    }
});

router.post('/manage-feature', async (req, res) => {
    const { action, featureName } = req.body;

    if (!action || !featureName || (action !== 'apply' && action !== 'revert')) {
        return res.status(400).json({ error: 'Invalid action or missing featureName.' });
    }

    const fileActionCommand = `${demoManagerScriptPath} ${action} ${featureName}`;
    let outputLog = "";

    try {
        outputLog += `Initiating file ${action} for '${featureName}'...\n`;
        outputLog += `Running file ${action} script (from ${demoDir})...\n`;
        const fileActionResult = await runScript(fileActionCommand, demoDir);
        outputLog += `File script output:\n${fileActionResult}\n`;

        res.json({
            message: `File ${action} sequence completed. Follow script steps for Guepard & servers.`,
            output: outputLog
        });
    } catch (error: any) {
        console.error(`Error during manage-feature ${action}:`, error);
        outputLog += `❌ ERROR: ${error instanceof Error ? error.message : String(error)}\n`;
        res.status(500).json({
            error: `Failed during file ${action} for '${featureName}'. Check logs.`,
            details: error instanceof Error ? error.message : String(error),
            output: outputLog
        });
    }
});

router.post('/switch-db', async (req, res) => {
  const { mainConnectionString, shadowConnectionString } = req.body;
  if (!mainConnectionString) {
    return res.status(400).json({ error: 'Missing mainConnectionString in request body.' });
  }

  const command = `${demoManagerScriptPath} switch-db "${mainConnectionString}" "${shadowConnectionString || ''}"`;

  try {
    const output = await runScript(command, demoDir);
    res.json({ message: 'Database connection strings update initiated. Restart backend required.', output });
  } catch (error: any) {
    console.error(`Error executing switch-db script:`, error);
    res.status(500).json({ error: 'Failed to execute switch-db script.', details: error.message || error });
  }
});


router.post('/run-seed', async (req, res) => {
  try {
    const productCount = await prisma.product.count();
    if (productCount > 0) {
      return res.status(400).json({ error: 'Database is not empty. Seed command aborted.' });
    }

    const command = `cd components/api && bunx prisma db seed`;
    const output = await runScript(command, projectRootDir);
    res.json({ message: 'Seed command executed successfully.', output });

  } catch (error: any) {
     if (error.code === 'P2021' || error.message?.includes('does not exist')) {
         res.status(400).json({ error: 'Database schema not applied yet. Run migration before seeding.', details: error.message });
     } else {
        console.error("Error during seed check/execution:", error);
        res.status(500).json({ error: 'Failed to run seed.', details: error.message || error });
     }
  }
});

export default router;