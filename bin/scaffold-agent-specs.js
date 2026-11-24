#!/usr/bin/env node
import { run } from '../lib/cli.js';

try {
  await run(process.argv.slice(2));
} catch (error) {
  if (error.name === 'AbortError') {
    console.error(error.message);
    process.exitCode = 130;
  } else {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}
