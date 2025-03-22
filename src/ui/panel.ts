import {element} from './ui';

export class PanelBuilder {
  style: Partial<CSSStyleDeclaration> = {};
  children: HTMLElement[] = []
  weights = ""
  type: "row" | "col";
  id?: string;

  constructor(type: "row" | "col", id?: string) {
    this.id = id;
    this.type = type;
    this.style.display = "grid"
    this.style.gridGap = "10px"
    this.style.height = "100%"
  }

  add(weight: string, e: HTMLElement | PanelBuilder): PanelBuilder {
    e = e instanceof PanelBuilder ? e.build() : e
    this.children.push(e)
    this.weights += weight + " "
    return this
  }

  addAll(weight: string, elements: (HTMLElement | PanelBuilder)[]): PanelBuilder {
    elements.forEach(e => this.add(weight, e));
    return this;
  }

  maxWidth(width: string): PanelBuilder {
    this.style.maxWidth = width
    return this
  }

  maxHeight(height: string) {
    this.style.maxHeight = height
    return this
  }

  height(height: string) {
    this.style.height = height
    return this
  }

  gap(gap: string) {
    this.style.gap = gap
    return this
  }

  overflow(overflow: string) {
    this.style.overflow = overflow
    return this
  }

  overflowY(overflow: string) {
    this.style.overflowY = overflow
    return this
  }

  build(): HTMLDivElement {
    if (this.type == "row") {
      this.style.gridTemplateColumns = this.weights
    } else {
      this.style.gridTemplateRows = this.weights
    }
    let e = element('div', this.id ?? "", undefined, this.children) as HTMLDivElement;
    Object.assign(e.style, this.style);
    return e
  }
}

export function column(id?: string): PanelBuilder {
  return new PanelBuilder("col", id)
}

export function row(id?: string): PanelBuilder {
  return new PanelBuilder("row", id)
}
