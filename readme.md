# readme

## TL;DR
---
to strat run this one liner 
```
 npm run initial_setup
```
and open this link
http://localhost:3000/3apps.html

the example app is on
http://localhost:3000/app.html



### the long read:
the libs are in a lib directory 
and are called 3w_front and 3w_back

for the sake of making this work fast i made a few short cuts
- no typescript 
- no tests
- no DOM Binidng on newly created elments
- the libs and the example app making use of the libs are all in the same repo/dir

the good parts:
- the DOM update hapens without querying the entire DOM tree for every change
- we are only fetching the new changes for every client so this saves a lot of bandwith
- we are using a version for each key in order to preserve data integrity
- optimistic UI the DOM is changed first to provide a fast UX but if a change is not premited in the backend the lib will change the DOM back to display the backend data state
