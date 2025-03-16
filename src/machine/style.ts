export class CSSStyleDeclarationBuilder {
  private styles: Partial<CSSStyleDeclaration> = {};

  setProperty(property: keyof CSSStyleDeclaration, value: string | number | null): this {
    if (value === null) {
      delete this.styles[property];
    } else {
      this.styles[property as any] = value as any;
    }
    return this;
  }

  // --- Width and Height ---
  width = (value: string | number | null): this => this.setProperty('width', value);
  width100 = (): this => this.width("100&");

  height(value: string | number | null): this {
    return this.setProperty('height', value);
  }

  minWidth(value: string | number | null): this {
    return this.setProperty('minWidth', value);
  }

  minHeight(value: string | number | null): this {
    return this.setProperty('minHeight', value);
  }

  maxWidth(value: string | number | null): this {
    return this.setProperty('maxWidth', value);
  }

  maxHeight(value: string | number | null): this {
    return this.setProperty('maxHeight', value);
  }

  // --- Padding ---
  padding(value: string | number | null): this {
    return this.setProperty('padding', value);
  }

  paddingTop(value: string | number | null): this {
    return this.setProperty('paddingTop', value);
  }

  paddingRight(value: string | number | null): this {
    return this.setProperty('paddingRight', value);
  }

  paddingBottom(value: string | number | null): this {
    return this.setProperty('paddingBottom', value);
  }

  paddingLeft(value: string | number | null): this {
    return this.setProperty('paddingLeft', value);
  }

  // --- Margin ---
  margin(value: string | number | null): this {
    return this.setProperty('margin', value);
  }

  marginTop(value: string | number | null): this {
    return this.setProperty('marginTop', value);
  }

  marginRight(value: string | number | null): this {
    return this.setProperty('marginRight', value);
  }

  marginBottom(value: string | number | null): this {
    return this.setProperty('marginBottom', value);
  }

  marginLeft(value: string | number | null): this {
    return this.setProperty('marginLeft', value);
  }

  // --- Border ---
  border(value: string | number | null): this {
    return this.setProperty('border', value);
  }

  borderTop(value: string | number | null): this {
    return this.setProperty('borderTop', value);
  }

  borderRight(value: string | number | null): this {
    return this.setProperty('borderRight', value);
  }

  borderBottom(value: string | number | null): this {
    return this.setProperty('borderBottom', value);
  }

  borderLeft(value: string | number | null): this {
    return this.setProperty('borderLeft', value);
  }

  borderWidth(value: string | number | null): this {
    return this.setProperty('borderWidth', value);
  }

  borderColor(value: string | number | null): this {
    return this.setProperty('borderColor', value);
  }

  borderStyle(value: string | number | null): this {
    return this.setProperty('borderStyle', value);
  }

  borderRadius(value: string | number | null): this {
    return this.setProperty('borderRadius', value);
  }

  // --- Background ---
  background(value: string | null): this {
    return this.setProperty('background', value);
  }

  backgroundColor(value: string | null): this {
    return this.setProperty('backgroundColor', value);
  }

  backgroundImage(value: string | null): this {
    return this.setProperty('backgroundImage', value);
  }

  backgroundRepeat(value: string | null): this {
    return this.setProperty('backgroundRepeat', value);
  }

  backgroundPosition(value: string | null): this {
    return this.setProperty('backgroundPosition', value);
  }

  backgroundSize(value: string | null): this {
    return this.setProperty('backgroundSize', value);
  }

  backgroundAttachment(value: string | null): this {
    return this.setProperty('backgroundAttachment', value);
  }

  // --- Font ---

  fontFamily(value: string | null): this {
    return this.setProperty('fontFamily', value);
  }

  fontSize(value: string | number | null): this {
    return this.setProperty('fontSize', value);
  }

  fontWeight(value: string | number | null): this {
    return this.setProperty('fontWeight', value);
  }

  fontStyle(value: string | null): this {
    return this.setProperty('fontStyle', value);
  }

  fontVariant(value: string | null): this {
    return this.setProperty('fontVariant', value);
  }

  lineHeight(value: string | number | null): this {
    return this.setProperty('lineHeight', value);
  }


  // --- Text ---

  color(value: string | null): this {
    return this.setProperty('color', value);
  }

  textAlign(value: string | null): this {
    return this.setProperty('textAlign', value);
  }

  textDecoration(value: string | null): this {
    return this.setProperty('textDecoration', value);
  }

  textTransform(value: string | null): this {
    return this.setProperty('textTransform', value);
  }

  textIndent(value: string | number | null): this {
    return this.setProperty('textIndent', value);
  }

  letterSpacing(value: string | number | null): this {
    return this.setProperty('letterSpacing', value);
  }

  wordSpacing(value: string | number | null): this {
    return this.setProperty('wordSpacing', value);
  }

  whiteSpace(value: string | null): this {
    return this.setProperty('whiteSpace', value);
  }

  // --- Positioning ---
  position(value: string | null): this {
    return this.setProperty('position', value);
  }

  top(value: string | number | null): this {
    return this.setProperty('top', value);
  }

  right(value: string | number | null): this {
    return this.setProperty('right', value);
  }

  bottom(value: string | number | null): this {
    return this.setProperty('bottom', value);
  }

  left(value: string | number | null): this {
    return this.setProperty('left', value);
  }

  zIndex(value: string | number | null): this {
    return this.setProperty('zIndex', value);
  }


  // --- Display and Visibility ---

  display(value: string | null): this {
    return this.setProperty('display', value);
  }

  visibility(value: string | null): this {
    return this.setProperty('visibility', value);
  }

  opacity(value: string | number | null): this {
    return this.setProperty('opacity', value);
  }

  // --- Overflow ---
  overflow(value: string | null): this {
    return this.setProperty('overflow', value);
  }

  overflowX(value: string | null): this {
    return this.setProperty('overflowX', value);
  }

  overflowY(value: string | null): this {
    return this.setProperty('overflowY', value);
  }

  // --- Flexbox ---

  displayFlex(): this {
    return this.display('flex');
  }

  flexDirection(value: string | null): this {
    return this.setProperty('flexDirection', value);
  }

  justifyContent(value: string | null): this {
    return this.setProperty('justifyContent', value);
  }

  alignItems(value: string | null): this {
    return this.setProperty('alignItems', value);
  }

  alignContent(value: string | null): this {
    return this.setProperty('alignContent', value);
  }

  flexWrap(value: string | null): this {
    return this.setProperty('flexWrap', value);
  }

  flexGrow(value: string | number | null): this {
    return this.setProperty('flexGrow', value);
  }

  flexShrink(value: string | number | null): this {
    return this.setProperty('flexShrink', value);
  }

  flexBasis(value: string | null): this {
    return this.setProperty('flexBasis', value);
  }

  order(value: string | number | null): this {
    return this.setProperty('order', value);
  }

  alignSelf(value: string | null): this {
    return this.setProperty('alignSelf', value);
  }

  // --- Grid ---
  displayGrid(): this {
    return this.display('grid');
  }

  columns(value: string | null): this {
    return this.setProperty('gridTemplateColumns', value);
  }

  gridTemplateRows(value: string | null): this {
    return this.setProperty('gridTemplateRows', value);
  }

  gridTemplateAreas(value: string | null): this {
    return this.setProperty('gridTemplateAreas', value);
  }

  gridGap(value: string | null): this {
    return this.setProperty('gridGap', value);
  }

  gridColumnGap(value: string | null): this {
    return this.setProperty('gridColumnGap', value);
  }

  gridRowGap(value: string | null): this {
    return this.setProperty('gridRowGap', value);
  }

  gridColumnStart(value: string | number | null): this {
    return this.setProperty('gridColumnStart', value);
  }

  gridColumnEnd(value: string | number | null): this {
    return this.setProperty('gridColumnEnd', value);
  }

  gridRowStart(value: string | number | null): this {
    return this.setProperty('gridRowStart', value);
  }

  gridRowEnd(value: string | number | null): this {
    return this.setProperty('gridRowEnd', value);
  }

  gridArea(value: string | null): this {
    return this.setProperty('gridArea', value);
  }

  justifySelf(value: string | null): this {
    return this.setProperty('justifySelf', value);
  }

  placeItems(value: string | null): this {
    return this.setProperty('placeItems', value);
  }

  placeContent(value: string | null): this {
    return this.setProperty('placeContent', value);
  }

  // --- Transitions and Animations ---

  transition(value: string | null): this {
    return this.setProperty('transition', value);
  }

  transitionProperty(value: string | null): this {
    return this.setProperty('transitionProperty', value);
  }

  transitionDuration(value: string | null): this {
    return this.setProperty('transitionDuration', value);
  }

  transitionTimingFunction(value: string | null): this {
    return this.setProperty('transitionTimingFunction', value);
  }

  transitionDelay(value: string | null): this {
    return this.setProperty('transitionDelay', value);
  }

  animation(value: string | null): this {
    return this.setProperty('animation', value);
  }

  animationName(value: string | null): this {
    return this.setProperty('animationName', value);
  }

  animationDuration(value: string | null): this {
    return this.setProperty('animationDuration', value);
  }

  animationTimingFunction(value: string | null): this {
    return this.setProperty('animationTimingFunction', value);
  }

  animationDelay(value: string | null): this {
    return this.setProperty('animationDelay', value);
  }

  animationIterationCount(value: string | number | null): this {
    return this.setProperty('animationIterationCount', value);
  }

  animationDirection(value: string | null): this {
    return this.setProperty('animationDirection', value);
  }

  animationFillMode(value: string | null): this {
    return this.setProperty('animationFillMode', value);
  }

  animationPlayState(value: string | null): this {
    return this.setProperty('animationPlayState', value);
  }

  // --- Transforms ---
  transform(value: string | null): this {
    return this.setProperty('transform', value);
  }

  transformOrigin(value: string | null): this {
    return this.setProperty('transformOrigin', value);
  }

  // --- Other ---

  cursor(value: string | null): this {
    return this.setProperty('cursor', value);
  }

  boxShadow(value: string | null): this {
    return this.setProperty('boxShadow', value);
  }

  outline(value: string | null): this {
    return this.setProperty('outline', value);
  }

  resize(value: string | null): this {
    return this.setProperty('resize', value);
  }

  listStyle(value: string | null): this {
    return this.setProperty('listStyle', value);
  }

  listStyleType(value: string | null): this {
    return this.setProperty('listStyleType', value);
  }

  listStyleImage(value: string | null): this {
    return this.setProperty('listStyleImage', value);
  }

  listStylePosition(value: string | null): this {
    return this.setProperty('listStylePosition', value);
  }

  tableLayout(value: string | null): this {
    return this.setProperty('tableLayout', value);
  }

  borderCollapse(value: string | null): this {
    return this.setProperty('borderCollapse', value);
  }

  borderSpacing(value: string | null): this {
    return this.setProperty('borderSpacing', value);
  }

  captionSide(value: string | null): this {
    return this.setProperty('captionSide', value);
  }

  emptyCells(value: string | null): this {
    return this.setProperty('emptyCells', value);
  }

  userSelect(value: string | null): this {
    return this.setProperty('userSelect', value);
  }

  content(value: string | null): this {
    return this.setProperty('content', value);
  }

  counterIncrement(value: string | null): this {
    return this.setProperty('counterIncrement', value);
  }

  counterReset(value: string | null): this {
    return this.setProperty('counterReset', value);
  }

  quotes(value: string | null): this {
    return this.setProperty('quotes', value);
  }

  // --- Build ---
  build(): Partial<CSSStyleDeclaration> {
    return {...this.styles}; // Return a copy to prevent external modification
  }

  // --- Apply to element (convenience method) ---
  applyTo(element: HTMLElement): HTMLElement {
    Object.assign(element.style, this.styles);
    return element
  }

  // Reset the builder
  reset(): this {
    this.styles = {};
    return this;
  }
}
