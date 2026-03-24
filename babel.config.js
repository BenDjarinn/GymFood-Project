// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [

      [
        "module-resolver",
        {
          alias: {
            "@": "./src",
            "@modules": "./src/modules",
            "@shared": "./src/shared",
          },
        },
      ],
    ],
  };
};
