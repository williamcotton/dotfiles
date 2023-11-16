module.exports = {
  range: (start, end) => 
    Array.from({length: end - start + 1}, (_, i) => start + i),
}