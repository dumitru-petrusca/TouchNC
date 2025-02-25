import replace from '@rollup/plugin-replace';

export default {
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'), // or 'development'
      preventAssignment: true
    })
  ]
};