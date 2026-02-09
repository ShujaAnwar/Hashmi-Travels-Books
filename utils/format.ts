
export function amountToWords(num: number, currency: string = 'PKR'): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n: number): string => {
    if (n < 0) return 'Negative ' + convert(Math.abs(n));
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return n.toString();
  };

  const amount = Math.floor(num);
  const cents = Math.round((num - amount) * 100);
  
  let unitName = 'Rupees';
  let subUnitName = 'Paisas';

  if (currency === 'SAR') {
    unitName = 'Saudi Riyals';
    subUnitName = 'Halalas';
  } else if (currency === 'USD') {
    unitName = 'US Dollars';
    subUnitName = 'Cents';
  } else if (currency === 'PKR') {
    unitName = 'Pakistani Rupees';
    subUnitName = 'Paisas';
  }

  let words = amount === 0 ? 'Zero' : convert(amount);
  words += ' ' + unitName;

  if (cents > 0) {
    words += ' and ' + convert(cents) + ' ' + subUnitName;
  }
  return words + ' Only';
}

export function formatDateTime(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
