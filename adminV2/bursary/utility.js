function f2w(num) {
    const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const scales = ['', 'thousand', 'million', 'billion', 'trillion'];

    function convertGroup(n) {
        let str = '';
        if (n >= 100) {
            str += units[Math.floor(n / 100)] + ' hundred ';
            n %= 100;
        }
        if (n >= 20) {
            str += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n >= 10) {
            str += teens[n - 10] + ' ';
        } else if (n > 0) {
            str += units[n] + ' ';
        }
        return str;
    }

    if (num === 0) return 'zero';

    let words = '';
    let i = 0;
    while (num > 0) {
        const group = num % 1000;
        if (group !== 0) {
            words = convertGroup(group) + scales[i] + ' ' + words;
        }
        num = Math.floor(num / 1000);
        i++;
    }
    return words.trim();
}



  function key(token){
      return token.replaceAll(" ","").replaceAll("/", "_").replaceAll(",", "").trim();
    }
  function sessionKey(session){
      return key(session.year+"term"+session.term);
    }





//console.log(numberToWords(12345)); // Output: "twelve thousand three hundred forty-five"