# PAMGuard website
PAMGuard website development area

Development area for [PAMGuard website](https://www.pamguard.org). 

Website is currently being developed with [Quarto](https://quarto.org/)

Source get's quite large with all the API docs and a dump of several hundred
files from the online help section, so keeping all the development here and only
moving a built version to pamguard.github.io for deployment. 

API and Online Help files have been excluded from this repository. Both are 
automatically built from the PAMGuard source code, so can be copied directly into
the released website docs. They should be included in subfolders ./api and ./olhelp 
within the root folder respectively for links from the rest of the site to work.
