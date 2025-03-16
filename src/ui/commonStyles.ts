let classes: CssClass[] = []

export class Css {
  public readonly style: string

  constructor(style: string) {
    this.style = style;
  }
}

export class CssClass {
  public readonly name: string
  style: string;

  constructor(name: string, style: string) {
    this.name = name;
    this.style = style;
  }

  plus(css?: CssClass) {
    if (css == undefined) {
      return this;
    }
    return new CssClass(this.name + " " + css.name, "")
  }
}

export function css(css: TemplateStringsArray): Css {
  return new Css(css.toString())
}

export function cssClass(name: string, css: Css): CssClass {
  let cssClass = new CssClass(name, css.style);
  classes.push(cssClass)
  return cssClass
}

export function registerClasses(): void {
  for (const c of classes) {
    // console.log(`Registering class ${c.name} = ${c.style}`)
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `.${c.name} { ${c.style} }`;
    document.head.appendChild(style);
  }
}

export const textInputClass = cssClass("textInput", css`
  display: inline-block;
  text-align: left;
  font-size: 0.85em;
  user-select: auto;
  outline: none;
  cursor: pointer;
  border: none;
  background: lightcyan;
  padding: 0;
  width: 100%;
  height: 40px;
`)

cssClass("textInput:disabled", css`
  background: #f0f0f0;
  color: black;
`)

export const btnClass = cssClass("btn", css`
  display: inline-block;
  text-align: center;
  font-size: 0.85em;
  outline: none;
  cursor: pointer;
  background-color: lightblue;
  border: none;
  padding: 0;
  width: 100%;
  height: 40px;
  vertical-align: middle;
`)

cssClass("btn:disabled", css`
  background: #f0f0f0;
  color: black;
`)

cssClass("btn:hover", css`
`)

cssClass("btn:active", css`
  background: #d0f0d0
`)

export const floatingButtonClass = cssClass("floatingButton", css`
  position: absolute;
  top: 0.25em;
  right: 0.25em;
  z-index: 1;
  width: 2em;

  display: inline-block;
  text-align: center;
  font-size: 0.85em;
  outline: none;
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 0;
  height: 40px;
`)

export const navRowClass = cssClass("navRow", css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 8fr 1fr 1fr 1fr 2fr 2fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

export const transparentClass = cssClass("transparent", css`
  background-color: transparent;
  text-align: left;
`)

export const tabletTabClass = cssClass("tablettab", css`
  display: grid;
  grid-template-rows: auto auto auto 1fr;
  gap: 10px;
  text-align: center;
  background-color: #ffffff;
  font-family: sans-serif;
  font-size: 3.2rem;
  user-select: none;

  padding-top: 10px;
  padding-bottom: 10px;

  width: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
`)

export const mposClass = cssClass("mpos", css`
  padding-top: 0.1em;
  font-size: 0.9em;
  color: #606060;
  justify-self: right;
`)
