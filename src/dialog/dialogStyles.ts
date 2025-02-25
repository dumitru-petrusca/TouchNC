
import {css, cssClass} from '../ui/commonStyles';

export const modalClass = cssClass("modal", css`
  display: none;
  position: fixed;
  z-index: 10000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
  -webkit-animation-name: fadeIn;
  -webkit-animation-duration: 0.4s;
  animation-name: fadeIn;
  animation-duration: 0.4s;
`)

export const textRowClass = cssClass("textRow", css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

export const titleRowClass = cssClass("titleRow", css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

export const titleClass = cssClass("title", css`
  background: lightcyan;
  align-content: center;
`)

export const contentClass = cssClass("content", css`
  display: grid;
  grid-template-rows: auto auto;
  gap: 10px;
  border-radius: 10px;
  border: 2px solid #337AB7;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  position: relative;
  margin: auto;
  padding: 10px;
  background-color: #fefefe;
  -webkit-animation-name: slideIn;
  -webkit-animation-duration: 0.4s;
  animation-name: slideIn;
  animation-duration: 0.4s;
  font-family: sans-serif;
  font-size: 3.2rem;
  width: 60%;
`)

export const oneButtonRowClass = cssClass("oneButtonRow", css`
  display: grid;
  grid-template-columns: 100px;
  justify-content: right;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

export const twoButtonRowStyle = cssClass("twoButtonRow", css`
  display: grid;
  grid-template-columns: 100px 100px;
  justify-content: right;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)
