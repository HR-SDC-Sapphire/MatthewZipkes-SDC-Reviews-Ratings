# System Design Capstone

## Rating and Reviews API Service

<br>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#contributor">Contributor</a></li>
    <li>
      <a href="#project-overview">Project Overview</a>
      <ul>
        <li><a href="#tech-stack">Tech Stack</a></li>
      </ul>
    </li>
<!--     <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li> -->
    <li><a href="#api-endpoints">API Endpoints</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>
<br>

# Contributor

### Matthew Zipkes - matthewzipkes@gmail.com

<img src="![MatthewZipkes](https://user-images.githubusercontent.com/81441621/149183705-ce9c48bf-0eb5-4e00-aae8-3b7f99dc9756.jpg)" alt="MatthewZipkes" height="150">
<br>

[![linkedin-shield]][cory-linkedin]

[![github-shield]][cory-github]

<br>

# Project Overview

I was tasked to develop a RESTful API service for a mock online clothing store's "Questions and Answers" section. I was provided three csv files with millions of data points for consideration. The tech stack was completely up to me to decide and the biggest decision I had to make was which DBMS to use. I chose the PostgreSQL relational database because it would provide an ideal data structure for the imported data and I knew the queries could be tuned to respond quickly.

I encountered a challenge while importing the data into the database due to a 13 digit Unix timestamp, which Postgres did not natively accept. I solved this by transforming the Unix timestamp into a Postgres readable timestamp during the ETL process.

Server-side caching was implemented with Redis and brought the average response time from 50-80 ms down to 5-15 ms per request.

Once the server and database were fully functioning with the front end client, I deployed the server and database on separate AWS EC2 instances. Extensive integration, unit, and stress testing was developed locally and performed after deploying to ensure optimal functioning. The single server could handle over 1000 requests per second without error, but the response time began to significantly increase between 700 and 800 requests per second. This is where my time on this projected ended, but my next step would have been to implement multiple server instances and a load balancer.

<br><br>

# Tech Stack

HTTP Server

- [Express](https://expressjs.com/)

Database Management System

- [MongoDB](https://www.mongodb.com/)

Testing & Monitoring

- [Jest](https://jestjs.io)
- [SuperTest](https://github.com/visionmedia/supertest)
- [Artillery](https://github.com/artilleryio/artillery)
- [loader.io](https://loader.io/)
- [New Relic](https://newrelic.com)

<br><br>

# API Endpoints

## <u>List Reviews</u>

GET Endpoint: `/reviews/`

Returns a list of reviews for a particular product. This list does not include any reported reviews.
<br>

### <strong>Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>product_id</td>
<td>integer</td>
<td>Specifies the product for which to retrieve questions.</td>
</tr>
</tbody>
</table>
<br>

### <strong>Query Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>page</td>
<td>integer</td>
<td>Selects the page of results to return. Default 1.</td>
</tr>
<tr>
<td>count</td>
<td>integer</td>
<td>Specifies how many results per page to return. Default 5.</td>
</tr>
</tbody>
</table>

<br>

Response Status: `200 OK`

<br>

## <u>Answers List</u>

Returns answers for a given question. This list does not include any reported answers.

GET Endpoint: `/qa/questions/:question_id/answers`

<br>

### <strong>Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>question_id</td>
<td>integer</td>
<td>Required ID of the question for which answers are needed.</td>
</tr>
</tbody>
</table>
<br>

### <strong>Query Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>page</td>
<td>integer</td>
<td>Selects the page of results to return. Default 1.</td>
</tr>
<tr>
<td>count</td>
<td>integer</td>
<td>Specifies how many results per page to return. Default 5.</td>
</tr>
</tbody>
</table>

<br>

Response Status: `200 OK`

<br>

## <u>Add a Question</u>

Adds a question for the given product.

POST Endpoint: `/qa`

<br>

### <strong>Body Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>body</td>
<td>text</td>
<td>Text of question being asked.</td>
</tr>
<tr>
<td>name</td>
<td>text</td>
<td>Username for question asker.</td>
</tr>
<tr>
<td>email</td>
<td>text</td>
<td>Email address for question asker.</td>
</tr>
<tr>
<td>product_id</td>
<td>integer</td>
<td>Required ID of the Product for which the question is posted.</td>
</tr>
</tbody>
</table>

<br>

Response Status: `201 CREATED`

<br>

## <u>Add an Answer</u>

Adds an answer for the given question.

POST Endpoint: `/qa/:question_id/answers`

<br>

### <strong>Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>question_id</td>
<td>integer</td>
<td>Required ID of the question being answered.</td>
</tr>
</tbody>
</table>
<br>

### <strong>Body Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>body</td>
<td>text</td>
<td>Text of answer.</td>
</tr>
<tr>
<td>name</td>
<td>text</td>
<td>Username for answerer.</td>
</tr>
<tr>
<td>email</td>
<td>text</td>
<td>Email address for answerer.</td>
</tr>
<tr>
<td>photos</td>
<td>[text]</td>
<td>An array of urls corresponding to images to display.</td>
</tr>
</tbody>
</table>

<br>

Response Status: `201 CREATED`

<br>

## <u>Mark Question as Helpful</u>

Updates a question to show it was found helpful.

PUT Endpoint: `/qa/questions/:question_id/helpful`

<br>

### <strong>Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>question_id</td>
<td>integer</td>
<td>Required ID of the question to update.</td>
</tr>
</tbody>
</table>
<br>

Response Status: `204 NO CONTENT`

<br>

## Report Question

Updates a question to show it was reported. Note, this action does not delete the question, but the question will not be returned in the above GET request.

PUT Endpoint: `/qa/questions/:question_id/report`

<br>

### <strong>Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>question_id</td>
<td>integer</td>
<td>Required ID of the question to update.</td>
</tr>
</tbody>
</table>
<br>

Response Status: `204 NO CONTENT`

<br>

## <u>Mark Answer as Helpful</u>

Updates an answer to show it was found helpful.

PUT Endpoint: `/qa/answers/:answer_id/helpful`

<br>

### <strong>Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>answer_id</td>
<td>integer</td>
<td>Required ID of the answer to update.</td>
</tr>
</tbody>
</table>
<br>

Response Status: `204 NO CONTENT`

<br>

## <u>Report Answer</u>

Updates an answer to show it has been reported. Note, this action does not delete the answer, but the answer will not be returned in the above GET request.

PUT Endpoint: `/qa/answers/:answer_id/report`

<br>

### <strong>Parameters</strong>

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>answer_id</td>
<td>integer</td>
<td>Required ID of the answer to update.</td>
</tr>
</tbody>
</table>
<br>

Response Status: `204 NO CONTENT`

<br><br>

## Acknowledgements

- [Node](https://nodejs.org/)
- [Img Shields](https://shields.io)
- [AWS EC2](https://aws.amazon.com/ec2/?ec2-whats-new.sort-by=item.additionalFields.postDateTime&ec2-whats-new.sort-order=desc)

[cory-linkedin]: https://www.linkedin.com/in/coryellerbroek/
[cory-github]: https://github.com/LrBrK33
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-grey?style=for-the-badge&logo=linkedin
[github-shield]: https://img.shields.io/badge/-GitHub-grey?style=for-the-badge&logo=github
