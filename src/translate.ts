import {englishtrans} from './language/en';

let language = 'en';

let language_list = [
//removeIf(de_lang_disabled)
  ['de', 'Deutsch', 'germantrans'],
//endRemoveIf(de_lang_disabled)
//removeIf(en_lang_disabled)
  ['en', 'English', englishtrans],
//endRemoveIf(en_lang_disabled)
//removeIf(es_lang_disabled)
  ['es', 'Espa&ntilde;ol', 'spanishtrans'],
//endRemoveIf(es_lang_disabled)
//removeIf(fr_lang_disabled)
  ['fr', 'Fran&ccedil;ais', 'frenchtrans'],
//endRemoveIf(fr_lang_disabled)
//removeIf(it_lang_disabled)
  ['it', 'Italiano', 'italiantrans'],
//endRemoveIf(it_lang_disabled)
//removeIf(ja_lang_disabled)
  ['ja', '&#26085;&#26412;&#35486;', 'japanesetrans'],
//endRemoveIf(ja_lang_disabled)
//removeIf(hu_lang_disabled)
  ['hu', 'Magyar', 'hungariantrans'],
//endRemoveIf(hu_lang_disabled)
//removeIf(pl_lang_disabled)
  ['pl', 'Polski', 'polishtrans'],
//endRemoveIf(pl_lang_disabled)
//removeIf(ptbr_lang_disabled)
  ['ptbr', 'Português-Br', 'ptbrtrans'],
//endRemoveIf(ptbr_lang_disabled)
//removeIf(ru_lang_disabled)
  ['ru', 'Русский', 'russiantrans'],
//endRemoveIf(ru_lang_disabled)
//removeIf(tr_lang_disabled)
  ['tr', 'T&uuml;rk&ccedil;e', 'turkishtrans'],
//endRemoveIf(tr_lang_disabled)
//removeIf(uk_lang_disabled)
  ['uk', 'Українська', 'ukrtrans'],
//endRemoveIf(uk_lang_disabled)
//removeIf(zh_cn_lang_disabled)
  ['zh_CN', '&#31616;&#20307;&#20013;&#25991;', 'zh_CN_trans'],
//endRemoveIf(zh_cn_lang_disabled)
];

// //removeIf(production)
// let translated_list = [];
//
// //endRemoveIf(production)

function build_language_list(id_item: string) {
  let content = "<select class='form-control'  id='" + id_item + "' onchange='translate_text(this.value)'>\n";
  for (let lang_i = 0; lang_i < language_list.length; lang_i++) {
    content += "<option value='" + language_list[lang_i][0] + "'";
    if (language_list[lang_i][0] == language) content += " selected";
    content += ">" + language_list[lang_i][1] + "</option>\n";
  }
  content += "</select>\n";
  return content;
}

function translate_text(lang: string) {
  language = lang;
  let currentTranslation = {};
  for (let lang_i = 0; lang_i < language_list.length; lang_i++) {
    if (language_list[lang_i][0] == lang) {
      currentTranslation = language_list[lang_i][2];
    }
  }
  let elements = document.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].hasAttribute('translate')) {
      let content = "";
      if (!elements[i].hasAttribute('english_content')) {
        content = elements[i].innerHTML;
        content.trim();
        elements[i].setAttribute('english_content', content);
        // //removeIf(production)
        // let item = {
        //   content: content
        // };
        // translated_list.push(item);
        // //endRemoveIf(production)
      }
      content = elements[i].getAttribute('english_content')!;
      elements[i].innerHTML = translate(content);
    }
    //add support for placeholder attribut
    if (elements[i].hasAttribute('translateph') && elements[i].hasAttribute('placeholder')) {
      let content = "";
      if (!elements[i].hasAttribute('english_content')) {
        content = elements[i].getAttribute('placeholder')!;
        content.trim();
        // //removeIf(production)
        // let item = {
        //   content: content
        // };
        // translated_list.push(item);
        // //endRemoveIf(production)
        elements[i].setAttribute('english_content', content);
      }
      content = elements[i].getAttribute('english_content')!;
      elements[i].setAttribute('placeholder', decodeHtml(translate(content))!)
    }
  }
}

export function decodeHtml(text: string) {
  const e = document.createElement('div');
  e.innerHTML = text;
  return e.textContent;
}

export function translate(item_text: string, withTag: boolean = false) {
  // TODO-dp do this loop once
  let currentTranslation: any = [];
  for (let i = 0; i < language_list.length; i++) {
    if (language_list[i][0] == language) {
      currentTranslation = language_list[i][2];
    }
  }
  let translated = currentTranslation[item_text];
  if (translated === undefined) translated = item_text;
  if (withTag) {
    translated = "<span english_content=\"" + item_text + "\" translate>" + translated + "</span>";
  }
  return translated;
}
