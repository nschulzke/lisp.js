const i = require('../');

beforeEach(() => {
  i.init();
});

describe('basic types', () => {
  it('has a string type', () => {
    expect(i('"hi"')).toEqual('hi');
    expect(i('"hi with spaces"')).toEqual('hi with spaces');
    expect(i('"hi with (parens)"')).toEqual('hi with (parens)');
  });
  it('has a number type', () => {
    expect(i('3')).toEqual(3);
    expect(i('3.3')).toEqual(3.3);
  });
  it('has an empty list type', () => {
    expect(i('()')).toEqual([]);
  });
  it('has a map type', () => {
    expect(typeof i('(map (hi 1) (hi 2))')).toBe('function');
    expect(i('(map (a 1) (b 2))').toString()).toBe('(map (a 1) (b 2))');
  });
  it('has a list type', () => {
    expect(typeof i('(list 1 2 3 4)')).toBe('function');
    expect(i('(list 1 2 3 4)').toString()).toBe('(list 1 2 3 4)');
  });
  it('has a lambda type', () => {
    expect(typeof i('(lambda (a b) (* a b))')).toBe('function');
    expect(i('(lambda (a b) (* a b))').toString()).toBe('(lambda (a b) (* a b))');
  });
});

describe('boolean comparisons', () => {
  it('has an equals operator', () => {
    expect(i('(= 3 4')).toBe(false);
    expect(i('(= 4 4')).toBe(true);
    expect(i('(= "a" "b"')).toBe(false);
    expect(i('(= "a" "a"')).toBe(true);
    expect(i('(= "4" 4')).toBe(false);
  });
  it('has a not equals operator', () => {
    expect(i('(!= 3 4')).toBe(true);
    expect(i('(!= 4 4')).toBe(false);
    expect(i('(!= "a" "b"')).toBe(true);
    expect(i('(!= "hello, world!" "hello, world!"')).toBe(false);
    expect(i('(!= "4" 4')).toBe(true);
  });
  it('has a less than operator', () => {
    expect(i('(< 3 4')).toBe(true);
    expect(i('(< 4 4')).toBe(false);
    expect(i('(< 4 3')).toBe(false);
  });
  it('has a greater than operator', () => {
    expect(i('(> 3 4')).toBe(false);
    expect(i('(> 4 4')).toBe(false);
    expect(i('(> 4 3')).toBe(true);
  });
  it('has a less than or equal to operator', () => {
    expect(i('(<= 3 4')).toBe(true);
    expect(i('(<= 4 4')).toBe(true);
    expect(i('(<= 4 3')).toBe(false);
  });
  it('has a greater than or equal to operator', () => {
    expect(i('(>= 3 4')).toBe(false);
    expect(i('(>= 4 4')).toBe(true);
    expect(i('(>= 4 3')).toBe(true);
  });
});

describe('lambdas', () => {
  it('runs anonymous lambdas', () => {
    expect(i(`
        (lambda
          (a)
          (* a a)
        ) 3
    `)).toEqual(9);
  });
  it('runs named auto-run lambdas', () => {
    expect(i(`
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
  it('curries anonymous lambdas', () => {
    expect(i(`
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
  it('curries named lambdas', () => {
    expect(i(`
      begin
      (def three
        (lambda (a b c) (+ a (+ b c))))
      (def two (three 2))
      (def one (two 2))
      (one 2)
    `)).toEqual(6);
  });
  it('nests lambdas', () => {
    expect(i(`
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
  it('uses lexical closure for arguments', () => {
    expect(i(`
      (begin
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
  it('uses lexical closure for defines', () => {
    expect(i(`
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
});

describe('maps', () => {
  it('can execute lambda functions', () => {
    expect(i(`
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
  it('provides access to the map within itself', () => {
    expect(i(`
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
});

describe('control constructs', () => {
  it('can use if and recursion to build a range function', () => {
    expect(i(`
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
  it('allows adding an unlimited number of arguments', () => {
    expect(i(`
    (+ 1 1 1 1 1 1)
    `)).toEqual(6);
  });
});

describe('objects', () => {
  it('can build an object with begin and lambda', () => {
    expect(i(`
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
  it('can build an immutable object with method returns', () => {
    expect(i(`
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
  it('can build a mutable object with method mutations', () => {
    expect(i(`
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
});

describe('mutability checks', () => {
  it('forbids updating const', () => {
    expect(() => i(`
    begin
      (const hi 3)
      (set hi 4)
      (hi)
    `)).toThrowErrorMatchingSnapshot();
  });
  it('allows updating def', () => {
    expect(i(`
    begin
      (def hi 3)
      (set hi 4)
      (hi)
    `)).toEqual(4);
  });
  it('forbids redefining const', () => {
    expect(() => i(`
    begin
      (const hi 3)
      (const hi 4)
      (hi)
    `)).toThrowErrorMatchingSnapshot();
  });
  it('forbids redefining def', () => {
    expect(() => i(`
    begin
      (def hi 3)
      (def hi 4)
      (hi)
    `)).toThrowErrorMatchingSnapshot();
  });
});
