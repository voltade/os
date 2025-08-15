/** @type {import('@oclif/core/interfaces').OclifConfiguration} */
export default {
  bin: 'voltade',
  dirname: 'voltade',
  commands: './dist/commands',
  plugins: ['@oclif/plugin-help', '@oclif/plugin-plugins'],
};
