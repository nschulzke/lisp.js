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
      (let c (counter ()))
