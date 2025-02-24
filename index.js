const http = require('http');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors')
const bodyParser = require('body-parser');
const hostname = '127.0.0.1';
const fs = require('fs');
const port = 3000;

const { readFileSync } = require("fs");
var path = require("path");
let cer_part = path.join(process.cwd(), 'isrgrootx1.pem');

const connection = mysql.createConnection({
    host: 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    user: '2vigaSZ1CEyTa8R.root',
    password:"sKd13bwKUy47FZEv",
    database: 'MABS_IMI',
    port:4000,
    ssl:{
      ca:fs.readFileSync(cer_part)
    }
  });

  

app.use(cors())
app.use(express.json())
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', (req, res) => {
    res.json({
        "Name":"MABS Project",
        "Author":"Adithep Hasim",
        "APIs":[
            {"api_name":"/getDoctors/","method":"get"},
            {"api_name":"/getDoctor/:id","method":"get"},
            {"api_name":"/addDoctor/","method":"post"},
            {"api_name":"/editDoctor/","method":"put"},
            {"api_name":"/deleteDoctor/","method":"delete"},
        ]
    });
});

app.get('/getDoctors', (req, res) => {
  let sql = "SELECT * FROM doctor ";  
  connection.query(sql, function(err, results) {
      if (err) {
          console.error("Error:", err);
          return res.json({ error: true, msg: err.message });
      }
      res.json(results);
  });
});


app.get('/getdoctor/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'SELECT * FROM doctor WHERE doctor_id = ?';
    connection.query(sql,[id], function(err, results, fields) {
          res.json(results);
        }
      );
});

app.get('/getpatients/', (req, res) => {
    let sql = 'SELECT * FROM patient';
    connection.query(sql, function(err, results, fields) {
          res.json(results);
        }
      );
});

app.get('/getpatient/:id', (req, res) => {
    let sql = 'SELECT * FROM patient WHERE patient_id = ?';
    connection.query(sql, function(err, results, fields) {
          res.json(results);
        }
      );
});



//CRUD Doctor
app.post('/addDoctor',urlencodedParser, (req, res) => {
  console.log(req.body);
    let sql = 'INSERT INTO doctor(d_name, department, phone) VALUES (?,?,?)';
    let values = [req.body.d_name,req.body.department,req.body.phone];
    let message = "Cannot Insert";
    connection.query(sql,values, function(err, results, fields) {
      if(results) { message = "Inserted";}
          res.json({error:false,data:results,msg:message});
        }
      );
});

app.put('/editDoctor', urlencodedParser, (req, res) => {
  console.log("Received Data:",req.body);
  let sql = 'UPDATE doctor SET d_name =?, department=?, phone=? WHERE doctor_id=? ';
  let values = [req.body.d_name,req.body.department,req.body.phone, req.body.doctor_id];
  let message = "Cannot Edit";

  connection.query(sql,values, function(err, results, fields) {
        if(results) { message = "Updated";}
        res.json({error:false,data:results,msg:message});
      }
    );
});

app.delete('/deleteDoctor/:doctor_id', (req, res) => {
  let doctorId = req.params.doctor_id; // รับค่า doctor_id จากพารามิเตอร์ URL
  let sql = 'DELETE FROM doctor WHERE doctor_id = ?';
  connection.query(sql, [doctorId], function(err, results) {
      if (err) {
          return res.json({ error: true, msg: err.message });
      }

      if (results.affectedRows > 0) {
          res.json({ error: false, msg: "Doctor deleted successfully" });
      } else {
          res.json({ error: true, msg: "Doctor not found or already deleted" });
      }
  });
});

//CRUD appointment

app.get('/getAppt/', (req, res) => {
  let sql = 'SELECT * FROM appointment';
  connection.query(sql, function(err, results, fields) {
        res.json(results);
      }
    );
});


app.get('/getAppt/:id', (req, res) => {
  let appt_id = req.params.id;  // ดึงค่าจาก URL
  let sql = 'SELECT * FROM appointment WHERE appt_id = ?';
  
  // ใช้คำสั่ง SQL ที่มีการเตรียมคำถามเพื่อป้องกัน SQL Injection
  connection.query(sql, [appt_id], function(err, results, fields) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong!" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Appointment not found!" });
    }
    
    res.json(results);  // ส่งกลับข้อมูลการนัดหมายที่พบ
  });
});

app.post('/addAppt',urlencodedParser, (req, res) => {
  console.log(req.body);
    let sql = 'INSERT INTO appointment(doctor_id, patient_id, date_time) VALUES (?,?,?)';
    let values = [req.body.doctor_id,req.body.patient_id,req.body.date_time];
    let message = "Cannot Insert";
    connection.query(sql,values, function(err, results, fields) {
      if(results) { message = "Inserted";}
          res.json({error:false,data:results,msg:message});
        }
      );
});

app.put('/editAppt', urlencodedParser, (req, res) => {
  console.log(req.body);
  let sql = 'UPDATE appointment SET doctor_id =?, patient_id=?, date_time=? WHERE appt_id=? ';
  let values = [req.body.doctor_id,req.body.patient_id,req.body.date_time, req.body.appt_id];
  let message = "Cannot Edit";

  connection.query(sql,values, function(err, results, fields) {
        if(results) { message = "Updated";}
        res.json({error:false,data:results,msg:message});
      }
    );
});

app.delete('/deleteAppt/:appt_id', (req, res) => {
  let apptId = req.params.appt_id; // รับค่า appt_id จากพารามิเตอร์ URL
  let sql = 'DELETE FROM appointment WHERE appt_id = ?';
  connection.query(sql, [apptId], function(err, results) {
      if (err) {
          return res.json({ error: true, msg: err.message });
      }

      if (results.affectedRows > 0) {
          res.json({ error: false, msg: "appointment deleted successfully" });
      } else {
          res.json({ error: true, msg: "appointment not found or already deleted" });
      }
  });
});
