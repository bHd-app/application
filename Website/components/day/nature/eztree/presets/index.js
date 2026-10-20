// Only the presets this site uses (the original ships sixteen).
import pineSmall from './pine_small.json';
import pineMedium from './pine_medium.json';
import pineLarge from './pine_large.json';
import aspenSmall from './aspen_small.json';
import aspenMedium from './aspen_medium.json';
import bush1 from './bush_1.json';
import TreeOptions from '../options';

export const TreePreset = {
  'Pine Small': pineSmall,
  'Pine Medium': pineMedium,
  'Pine Large': pineLarge,
  'Aspen Small': aspenSmall,
  'Aspen Medium': aspenMedium,
  'Bush 1': bush1,
};

/**
 * @param {string} name The name of the preset to load
 * @returns {TreeOptions}
 */
export function loadPreset(name) {
  const preset = TreePreset[name];
  return preset ? structuredClone(preset) : new TreeOptions();
}
