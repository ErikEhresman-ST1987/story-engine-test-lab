VAR helped_dinner = false
Juliette is preparing a community dinner.
+ [Volunteer to help.]
    ~ helped_dinner = true
    Wonderful! Bring the ingredients when you're ready.
    -> waiting
+ [Ask for more time.]
    Of course. I'll keep your place open.
    -> waiting
=== waiting ===
The dinner preparations are waiting for supplies.
-> END
