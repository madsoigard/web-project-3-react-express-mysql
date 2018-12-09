const express = require('express')
var db = require('./db')
const review = express.Router()
const fileUpload = require('express-fileupload');
var fs = require('fs');

review.use(fileUpload());


review.get("/", (req, res) => {
  const { year } = req.query
  var json = {}

  const review_query = _ => {
    let QUERY = `SELECT id, year, text FROM review`
    let specificYear = ` WHERE year = ${year}`
    year !== 'all' && (QUERY = QUERY.concat(specificYear))

    db.query(QUERY, (err, results) => {
      if (err) {
        return res.send(err)
      } else {
        json.reviewData = results
        slider_query()
      }
    })
  }
  const slider_query = _ => {
    let QUERY = `SELECT * FROM images`
    let specificYear = ` WHERE r_id = (SELECT id FROM review WHERE year = '${year}')`
    year !== 'all' && (QUERY = QUERY.concat(specificYear))
    db.query(QUERY, (err, results2) => {
      if (err) {
        return res.send(err)
      } else {
        json.slides = results2
        recordings_query()
      }
    })
  }
  const recordings_query = _ => {
    let QUERY = `SELECT * FROM video_links`
    let specificYear = ` WHERE r_id = (SELECT id FROM review WHERE year = '${year}')`
    year !== 'all' && (QUERY = QUERY.concat(specificYear))
    db.query(QUERY, (err, results3) => {
      if (err) {
        return res.send(err)
      } else {
        json.recordings = results3
        return res.send({ data: json })
      }
    })
  }
  review_query()
})

review.get('/recordings', (req, res) => {
  let { id } = req.query
  let QUERY = `SELECT * FROM video_links WHERE r_id = ${id}`
  db.query(QUERY, (err, results) => {
    if (err) return res.send(err)
    return res.json(results)

  })
})

review.post('/newReview', (req, res) => {
  const { year, text } = req.body
  let QUERY = `
    INSERT INTO review (year, text)
    VALUES (${year}, '${text}')
  `
  db.query(QUERY, (err, results) => {
    if (err) res.send(err)
    return res.json(results)
  })
})
review.post('/update', (req, res) => {
  const { id, year, text } = req.body
  let QUERY = `
    UPDATE review
    SET 
      year = '${year}', 
      text =  '${text}'
    WHERE id = ${id}
  `
  db.query(QUERY, (err, results) => {
    if (err) res.send(err);
    return res.json(results);
  });
})

review.post("/newRecording", (req, res) => {
  const { link, name, r_id } = req.body
  let QUERY = `
    INSERT INTO video_links (link, name, r_id)
    VALUES ('${link}', '${name}', ${r_id})
  `
  db.query(QUERY, (err, results) => {
    if (err) res.send(err);
    return res.json(results);
  });
})

review.post("/newImage", (req, res) => {
  const { title, caption, r_id } = req.body
  const imgFile = req.files.img
  let QUERY = `
    INSERT INTO images (title, caption, r_id) 
    VALUES ('${title}', '${caption}', ${r_id})
  `
  db.query(QUERY, (err, results) => {
    if (err) res.send(err)
    else {
      imgFile.mv(`${__dirname}/../react-app/src/uploadedImg/sliderImg/${results.insertId}`, function (err) {
        if (err) {
          return res.status(500).send(err);
        }
        return res.json(results);
      });
    }
  });
})

review.post("/deleteRecording", (req, res) => {
  const { id } = req.body
  let QUERY = `
    DELETE FROM video_links
    WHERE id = ${id}
  `
  db.query(QUERY, (err, results) => {
    if (err) res.send(err);
    return res.json(results);
  });
})

review.post("/deleteImage", (req, res) => {
  const { id } = req.body
  let QUERY = `
    DELETE FROM images
    WHERE id = ${id}
  `
  db.query(QUERY, (err, results) => {
    if (err) res.send(err);
    return res.json(results);
  });
})

module.exports = review