import { describe, expect, it } from 'vitest';
import { parseCsv } from '../lib/csv';

describe('parseCsv', () => {
  it('parses quoted fields, embedded commas, escaped quotes and BOM headers', () => {
    const rows = parseCsv('\uFEFFName,Detail,Status\r\n"Check, one","Value has ""quotes""",PASS\r\n');

    expect(rows).toEqual([
      {
        Name: 'Check, one',
        Detail: 'Value has "quotes"',
        Status: 'PASS'
      }
    ]);
  });

  it('handles LF and missing trailing values', () => {
    const rows = parseCsv('AssessmentType,Check,Status,Enabled\nE8,Credential Guard,,False\nMDE,Other,PASS,\n');

    expect(rows).toHaveLength(2);
    expect(rows[0].Enabled).toBe('False');
    expect(rows[1].Enabled).toBe('');
  });
});
