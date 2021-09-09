// declaration so that import works with css files containing classes
declare module "*.css" {
    const content: Record<string, string>;
    export default content;
}
