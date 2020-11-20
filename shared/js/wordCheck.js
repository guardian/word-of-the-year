function wordCount(str) {
     return str.split(' ')
            .filter(function(n) { return n != '' })
            .length;
}

export default function wordCheck(w1, w2) {
    return (wordCount(w1) < 2 && wordCount(w2) < 2) ? true : false ;
}