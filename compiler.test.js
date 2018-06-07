const tokenize = require('./compiler').tokenize;
const parse = require('./compiler').parse;
const evaluate = require('./compiler').evaluate;
const run = require('./compiler').run;

const RAW_1 =
  `(begin
    ((let r 10))
    (* pi (* r r))
  )`;
const TOKENIZED_1 =
  ['(', 'begin',
    '(', '(', 'let', 'r', '10', ')', ')',
    '(', '*', 'pi', '(', '*', 'r', 'r', ')', ')',
    ')'];
const PARSED_1 =
  ['begin',
    ['let', 'r', 10],
    ['*', 'pi', ['*', 'r', 'r']]
  ];
const EVALUATED_1 =
  Math.PI * 100;

const RAW_2 = `* 3 4`;
const TOKENIZED_2 = ['*', '3', '4'];
const PARSED_2 = ['*', 3, 4];
const EVALUATED_2 = 12;

const RAW_3 = `((* 3 4))`;
const TOKENIZED_3 = ['(', '(', '*', '3', '4', ')', ')'];
const PARSED_3 = ['*', 3, 4];
const EVALUATED_3 = 12;

const RAW_4a =
  `begin
    (let square
      (lambda (a) (* a a)))
    (square 3)
  `;
const TOKENIZED_4 =
  ['begin',
    '(', 'let', 'square',
    '(', 'lambda', '(', 'a', ')', '(', '*', 'a', 'a', ')', ')', ')',
    '(', 'square', '3', ')'
  ];
const PARSED_4 =
  ['begin',
    ['let', 'square',
      ['lambda', ['a'], ['*', 'a', 'a']]],
    ['square', 3]
  ];
const EVALUATED_4 = 9;

describe('run', () => {
  it('curries lambdas', () => {
    expect(run(`
      begin
      (let three
        (lambda (a b c) (+ a (+ b c))))
      (let two (three 2))
      (let one (two 2))
      (one 2)
    `)).toEqual(6);
  });
  it('allows running lambdas', () => {
    expect(run(`
        (lambda
          (a)
          (* a a)
        ) 3
    `)).toEqual(9);
  });
  it('allows defining automatically called lambdas', () => {
    expect(run(`
      begin
      (let square3 (
        (lambda
          a
          (* a a)
        ) 3
      ))
      (square3)
    `)).toEqual(9);
  });
  it('allows defining partial lambdas', () => {
    expect(run(`
      begin
      (let mult3 (
        (lambda
          (a b)
          (* a b)
        ) 3
      ))
      (mult3 3)
    `)).toEqual(9);
  });
  it('allows defining nested lambdas', () => {
    expect(run(`
      (begin
        (let two (lambda
          (x y)
          (
            (lambda
              (a b c)
              (* a (* b c))
            ) 2 x y
          )
        ))
        (two 2 2)
      )
    `)).toEqual(8);
  });
  it('allows using variables', () => {
    expect(run(`
      (begin
        (let harry 2)
        (let two ((lambda
          (x y)
          (
            (lambda
              (a b c)
              (* a (* b c))
            ) 2 x y
          )
        )))
        (two 2 harry)
      )
    `)).toEqual(8);
  });
  it('includes lexical closure', () => {
    expect(run(`
      (
        begin
        (let harry 2)
        (let two (lambda
          (x y)
          (
            (lambda
              (a b c)
              (* a (* b c))
            ) harry x y
          )
        ))
        (two 2 harry)
      )
    `)).toEqual(8);
  });
  it('provides a map object which can be used to execute lambdas', () => {
    expect(run(`
    begin
    (let math (map
      (mult
        (lambda (a b) (* a b))
      )
      (number 4)
      (sub
        (lambda (a b) (- a b))
      )
    ))
    ((math mult) 3 (math number))
    `)).toEqual(12);
  });
  it('provides self-access inside a map', () => {
    expect(run(`
    begin
    (let math (map
      (mult
        (lambda (a b) (* a b))
      )
      (number 4)
      (square
        (lambda (a) ((math mult) a a))
      )
    ))
    ((math square) (math number))
    `)).toEqual(16);
  });
  it('can use if and recursion to build a range function', () => {
    expect(run(`
    begin
    (let range (lambda
      (a b)
      (if (= a b)
        (literal ())
        (concat a (range (+ a 1) b))
      )
    ))
    (range 1 6)
    `)).toEqual([1, 2, 3, 4, 5]);
  });
  it('can define objects using begin and lambda', () => {
    expect(run(`
    begin
      (let rect
        (lambda (width height)
          (begin
            (map
              (area (lambda () (* width height)))
              (circ (lambda ()
                (+ width (+ height (+ width height
                )))
              ))
            )
          )
        )
      )
      (let r (rect 3 4))
      ((r area) ())
    `)).toEqual(12);
  });
  it('allows generation of new objects via lambdas', () => {
    expect(run(`
    begin
      (let rect
        (lambda (width height)
          (begin
            (map
              (setWidth (lambda (w) (rect w height)))
              (setHeight (lambda (h) (rect width h)))
              (area (lambda () (* width height)))
              (circ (lambda ()
                (+ width (+ height (+ width height
                )))
              ))
            )
          )
        )
      )
      (let r (rect 3 4))
      (let r ((r setWidth) 4))
      ((r area) ())
    `)).toEqual(16);
  });
  it('allows tracking of internal state', () => {
    expect(run(`
    begin
      (let counter
        (begin
          (let construct (lambda (init)
            (begin
              (let count init)
              (map
                (inc (lambda ()
                  (construct
                    (+ count 1)
                  )
                ))
                (count count)
              )
            )
          ))
          (construct 0)
        )
      )
      (let c counter)
      (let c ((c inc) ()))
      (let c ((c inc) ()))
      (c count)
    `)).toEqual(2);
  });
});

describe('tokenize', () => {
  it('tokenizes a simple program', () => {
    expect(tokenize(RAW_1)).toEqual(TOKENIZED_1);
  });
  it('tokenizes an expression without parens', () => {
    expect(tokenize(RAW_2)).toEqual(TOKENIZED_2);
  });
  it('tokenizes an expression with multiple parens', () => {
    expect(tokenize(RAW_3)).toEqual(TOKENIZED_3);
  });
  it('tokenizes an expression with multiple parens', () => {
    expect(tokenize(RAW_3)).toEqual(TOKENIZED_3);
  });
  it('tokenizes an expression with lambdas', () => {
    expect(tokenize(RAW_4a)).toEqual(TOKENIZED_4);
  });
});

describe('parse', () => {
  it('parses a simple program', () => {
    expect(parse(TOKENIZED_1)).toEqual(PARSED_1);
  });
  it('parses an expression without parens', () => {
    expect(parse(TOKENIZED_2)).toEqual(PARSED_2);
  });
  it('parses an expression with multiple parens', () => {
    expect(parse(TOKENIZED_3)).toEqual(PARSED_3);
  });
  it('parses an expression with lambdas', () => {
    expect(parse(TOKENIZED_4)).toEqual(PARSED_4);
  });
});

describe('evaluate', () => {
  it('evaluates a simple program', () => {
    expect(evaluate(PARSED_1)).toEqual(EVALUATED_1);
  });
  it('evaluates an expression without parens', () => {
    expect(evaluate(PARSED_2)).toEqual(EVALUATED_2);
  });
  it('evaluates an expression with multiple parens', () => {
    expect(evaluate(PARSED_3)).toEqual(EVALUATED_3);
  });
  it('evaluates an expression with lambdas', () => {
    expect(evaluate(PARSED_4)).toEqual(EVALUATED_4);
  });
});
