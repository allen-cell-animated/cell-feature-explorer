import postcssFlexbugsFixes from "postcss-flexbugs-fixes";
import postcssPresetEnv from "postcss-preset-env";

export default {
    plugins: [postcssFlexbugsFixes(), postcssPresetEnv()],
};
