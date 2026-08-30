const XLSX = require('xlsx');
const path = 'C:\Users\iP\Downloads\بحث الاصناف(1).xlsx';
const wb = XLSX.readFile(path);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
const skuKey = 'رقم الصنف', nameKey='اسم الصنف', priceKey='قطاعي', stockKey='الكميه الحاليه';
rows.forEach((r,i)=>{
  const s = Number(r[stockKey]);
  const p = Number(r[priceKey]);
  if (!r[nameKey] || p<=0 || !Number.isInteger(s) || s<0) {
    console.log(i+2, JSON.stringify(r));
  }
});
