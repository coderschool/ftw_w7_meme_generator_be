const texts = [
  {
    id: "text_top",
    content: "",
    color: "BLACK",
    size: 32,
    alignmentX: "HORIZONTAL_ALIGN_CENTER",
    alignmentY: "VERTICAL_ALIGN_TOP",
  },
  {
    id: "text_bottom",
    content: "",
    color: "BLACK",
    size: 32,
    alignmentX: "HORIZONTAL_ALIGN_CENTER",
    alignmentY: "VERTICAL_ALIGN_BOTTOM",
  },
];

const c = { text_id: "text_top", type: "content", value: "changed" };

const temp = JSON.parse(JSON.stringify(texts));

temp.map((text) => {
  if (text.id === c.text_id) {
    if (c.type in text) text[c.type] = c.value;
  }
  return text;
});
console.log({ texts, temp });
