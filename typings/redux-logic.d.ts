/* no longer necessary once https://github.com/jeffbski/redux-logic/pull/58 is merged */
declare module "redux-logic";

// declaration.d.ts
declare module "*.css" {
    const content: Record<string, string>;
    export default content;
}
// declare module "*.css" {
//     const styles: { [className: string]: string };
//     export = styles;
// }
