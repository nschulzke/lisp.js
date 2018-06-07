const run = require('../compiler').run;
const init = require('../compiler').init;

beforeEach(() => {
  init();
});

describe('run', () => {
  it('curries lambdas', () => {
    expect(run(`
      begin
      (def three
        (lambda (a b c) (+ a (+ b c))))
      (def two (three 2))
      (def one (two 2))
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
      (def square3 (
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
      (def mult3 (
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
        (def two (lambda
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
  it('allows using defiables', () => {
    expect(run(`
      (begin
        (def harry 2)
        (def two ((lambda
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
        (def harry 2)
        (def two (lambda
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
    (def math (map
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
    (def math (map
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
    (def range (lambda
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
      (def rect
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
      (def r (rect 3 4))
      ((r area) ())
    `)).toEqual(12);
  });
  it('allows generation of new objects via lambdas', () => {
    expect(run(`
    begin
      (def rect
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
      (def r (rect 3 4))
      (set r ((r setWidth) 4))
      ((r area) ())
    `)).toEqual(16);
  });
  it('allows tracking of internal state', () => {
    expect(run(`
    begin
      (def counter (lambda ()
        (begin
          (def count 0)
          (map
            (inc (lambda ()
              (set count (+ count 1))
            ))
            (count (lambda () count))
          )
        )
      ))
      (def c (counter ()))
      ((c inc) ())
      ((c inc) ())
      ((c count) ())
    `)).toEqual(2);
  });
  it('forbids updating const', () => {
    expect(() => run(`
    begin
      (const hi 3)
      (set hi 4)
      (hi)
    `)).toThrowErrorMatchingSnapshot();
  });
  it('forbids redefining const', () => {
    expect(() => run(`
    begin
      (const hi 3)
      (const hi 4)
      (hi)
    `)).toThrowErrorMatchingSnapshot();
  });
  it('forbids redefining def', () => {
    expect(() => run(`
    begin
      (def hi 3)
      (def hi 4)
      (hi)
    `)).toThrowErrorMatchingSnapshot();
  });
  it('allows adding an unlimited number of arguments', () => {
    expect(run(`
    (+ 1 1 1 1 1 1)
    `)).toEqual(6);
  });
});
