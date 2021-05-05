# Week \#

## Team Report

### Last week's goals
- Create unit tests that work in chrome for our existing extension
- Finish implementing a mock frontend ui
- Finish backend/middleware functions, write to Chrome local storage

### Progress and issues
Our team made good progress on all fronts (testing, frontend, and backend) but we ran into some issues for all of them.
Testing wise, we have CI integrated with our GitHub repo, but this took a lot of debugging due to issues between node.js and native javascript. We don't have many tests yet due to this time commitment.
We have a completely mocked front end, but due to some ambiguity around how we will store the data, some graphs had to be redesigned. There were also issues due to html & css bugs.
We had extensive discussions about data storage and some of it is still up in the air but we have integrated our backend with Google Sync Storage and creates some basic functions that shouldn't need to be changed.

### Plans for next week
- Make the backend detect when Chrome is in focus or minimized
- Clearly define data storage and make sure middleware functions align
- Create the data processing layer
- Hook up the frontend to mock data
- Increase the number of CI and UI tests

### Agenda
- Revisit discussion about data storage
- Talk about the upcoming assignment


## Individual Contributions

### Last week's goals

#### Richard Jiang (rjiang98)
- Finish implementing mock frontend ui

#### Nikhil Sharma (nys4)
- Finish backend/middleware functions, write to Chrome local storage

#### Patrick Sharp (sharp77)
- Write unit tests that work in chrome for our existing extension.

#### Yukai Yan (yukaiy)
- Finish backend/middleware functions, write to Chrome local storage

#### Zhennan Zhou (zhouz46)
- Finish implementing mock frontend ui



### Progress and issues

#### Richard Jiang (rjiang98)
- Updated exisitng living document with feedback
- Defined a data processing layer between middleware and frontend 

#### Nikhil Sharma (nys4)
- Set up CI on GitHub
- Integrated Chrome sync storage with backend


#### Patrick Sharp (sharp77)
- Set up CI on GitHub
- Added testing sections to living document

#### Yukai Yan (yukaiy)
- Integrated Chrome sync storage with backend
- Defined a data processing layer between middleware and frontend 

#### Zhennan Zhou (zhouz46)
- Defined a data processing layer between middleware and frontend 
- Finished core frontend structures


### Plans for next week

#### Richard Jiang (rjiang98)
- Implement data processing functions and connect frontend to read mock data

#### Nikhil Sharma (nys4)
- Make the backend detect when Chrome is in focus or minimized

#### Patrick Sharp (sharp77)
- Increase the number of CI and UI tests to more comprehensively test the application

#### Yukai Yan (yukaiy)
- Implement data processing functions and change middleware functions if needed to support the frontend

#### Zhennan Zhou (zhouz46)
- Implement data processing functions and connect frontend to read mock data
