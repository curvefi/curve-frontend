// todo: ligui is messing up any translation in the library code
// this is a temporary fix to avoid the issue of bad strings, given we are not using translations anymore
// however, it's useful  to keep a direct reference to all the translation strings for future use
export const t = (template: TemplateStringsArray) => template.join('');
