import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";
import { Match, Show, Switch, createResource, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import Header from "../components/Header";
import { Select } from "../components/Select";
import DeanConfirmationForm from "../components/DeanConfirmationForm";
import BursarConfirmationForm from "../components/BursarConfirmationForm";
import SendSMSForm from "../components/SendSMSForm";
import Loading from "../components/Loading";
import Failure from "../components/icons/Failure";
import Success from "../components/icons/Success";

const schema = z.object({
  level: z.string().min(1, "*Required"),
  category: z.string().min(1, "*Required"),
  department: z.string().min(1, "*Required"),
  semester: z.string().min(1, "*Required"),
});

export default function RegistrationForm() {
  const [user, setUser] = createStore();
  const [student, setStudent] = createStore();
  const [studentReg, setStudentReg] = createStore();
  const [adminCharges, setAdminCharges] = createStore();
  const [period, setPeriod] = createStore();
  const [portalWallet, setPortalWallet] = createSignal("");

  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env["VITE_API_URL"];
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [courses, setCourses] = createStore([]);
  const [coursesLevel, setCoursesLevel] = createSignal("");
  const [showCourses, setShowCourses] = createSignal(false);

  const [addDropStatus, setAddDropStatus] = createSignal("");
  const [regStatus, setRegStatus] = createSignal("");
  const [undertakingStatus, setUndertakingStatus] = createSignal("");
  const [addDropComment, setAddDropComment] = createSignal("");
  const [showNotification, setShowNotification] = createSignal(false);
  const [pickedCourses, setPickedCourses] = createStore([]);
  const [detPickedCourses, setDetPickedCourses] = createStore([]);
  const [droppedCourses, setDroppedCourses] = createStore([]);
  const [detDroppedCourses, setDetDroppedCourses] = createStore([]);
  const [addedCourses, setAddedCourses] = createStore([]);
  const [detAddedCourses, setDetAddedCourses] = createStore([]);
  const [totalCU, setTotalCU] = createSignal(0);
  const [droppedTotalCU, setDroppedTotalCU] = createSignal(0);
  const [addedTotalCU, setAddedTotalCU] = createSignal(0);
  const [totalProgFee, setTotalProgFee] = createSignal(0);
  const [droppedTotalProgFee, setDroppedTotalProgFee] = createSignal(0);
  const [addedTotalProgFee, setAddedTotalProgFee] = createSignal(0);

  const [showSendSMS, setShowSendSMS] = createSignal(false);
  const [dropped, setDropped] = createSignal(false);

  const [finished, setFinished] = createSignal(true);
  const [addDropFinished, setAddDropFinished] = createSignal(false);

  const [modeOfStudy, setModeOfStudy] = createSignal("");
  const [denomination, setDenomination] = createSignal("");

  const [prg, setPgr] = createSignal("");

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const registrationFormData = async () => {
    if (localStorage.getItem("jetsUser")) {
      const response = await fetch(
        VITE_API_URL +
          "/api/user/" +
          JSON.parse(localStorage.getItem("jetsUser")).custom_id,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }
      );
      const result = await response.json();
      if (result.response === "Expired token") {
        localStorage.removeItem("jetsUser");
        navigate("/", { replace: true });
      } else {
        var registration = await fetchRegistration();

        if (registration.registration_status !== "completed") {
          setFinished(false);
          return;
        } else if (registration.add_drop_status === "completed") {
          setAddDropFinished(true);
          return;
        } else {
          const request0 = fetch(
            VITE_API_URL + "/api/user/" + params.customId,
            {
              mode: "cors",
              headers: {
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("jetsUser")).token
                }`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              method: "GET",
            }
          ).then((response) => response.json());

          const request1 = fetch(
            VITE_API_URL + "/api/student/" + params.customId,
            {
              mode: "cors",
              headers: {
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("jetsUser")).token
                }`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              method: "GET",
            }
          ).then((response) => response.json());
          const request2 = fetch(
            VITE_API_URL + "/api/period/" + params.periodId,
            {
              mode: "cors",
              headers: {
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("jetsUser")).token
                }`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              method: "GET",
            }
          ).then((response) => response.json());
          const request3 = fetch(
            VITE_API_URL + "/api/portal-wallet/" + params.customId,
            {
              mode: "cors",
              headers: {
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("jetsUser")).token
                }`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              method: "GET",
            }
          ).then((response) => response.json());

          Promise.all([request0, request1, request2, request3])
            .then(([data0, data1, data2, data3]) => {
              setPortalWallet(data3.response.amount);
              setStudent(data1.response);
              setAdminCharges(JSON.parse(registration.seminary_charges));
              setStudentReg(registration);
              setRegStatus(registration.reg_status);
              setAddDropStatus(registration.add_drop_status);
              setUndertakingStatus(registration.undertaking);
              setAddDropComment(registration.comment);
              setPeriod(data2.response);
              setUser(data0.response);

              setModeOfStudy(
                user['mode_of_study'] === "virtual"
                  ? "Virtual"
                  : user['mode_of_study'] === "weekend"
                  ? "Weekend"
                  : "In-Person"
              );
              const _pg_ug = user['username'];
              const pr = (_pg_ug?.startsWith('04') || _pg_ug?.startsWith('14')) ? 'UG' : 'PG';
              setPgr(pr);

              if (registration.picked_courses) {
                // console.log(registration.picked_courses);
                getCourseDetails(JSON.parse(registration.picked_courses));
                setPickedCourses(JSON.parse(registration.picked_courses));
              }
              if (registration.dropped_courses) {
                getDroppedCourseDetails(
                  JSON.parse(registration.dropped_courses)
                );
                setDroppedCourses(JSON.parse(registration.dropped_courses));
              }
              if (registration.added_courses) {
                getAddedCourseDetails(JSON.parse(registration.added_courses));
                setAddedCourses(JSON.parse(registration.added_courses));
              }
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }
      return {
        student,
        adminCharges,
        period,
        studentReg,
        user,
        pickedCourses,
        droppedCourses,
        addedCourses,
        addDropStatus,
        undertakingStatus,
        addDropComment,
      };
    } else {
      navigate("/", { replace: true });
    }
  };

  var c = {};
  var total_cu = 0;
  var total_amt = 0;
  
  const getCourseDetails = async (arr) => {
    for (let i = 0; i < arr.length; i++) {
      try {
        var _denomination = student.denomination
        var _intl = student.special_student_category
        var _programme_category = student.programme_category

        const pgProgrammes = [
          "PGDT Programme",
          "Masters Programme",
          "Master of Divinity Programme"      
        ];

        if (pgProgrammes.includes(_programme_category)) {

          if (_intl === "yes") {
            setDenomination("INTL-PG");
          } else if (_denomination === "ECWA") {
            setDenomination("ECWA-PG");
          } else if (_denomination === "Non-ECWA") {
            setDenomination("Non-ECWA-PG");
          }

        } else if (_programme_category === "Bachelor of Arts Programme") {

          if (_intl === "yes") {
            setDenomination("INTL-UG");
          } else if (_denomination === "ECWA") {
            setDenomination("ECWA-UG");
          } else if (_denomination === "Non-ECWA") {
            setDenomination("Non-ECWA-UG");
          }

        } else if (_programme_category === "Diploma Programme") {

          if (_intl === "yes") {
            setDenomination("INTL-DIP");
          } else if (_denomination === "ECWA") {
            setDenomination("ECWA-DIP");
          } else if (_denomination === "Non-ECWA") {
            setDenomination("Non-ECWA-DIP");
          }

        } else if (_programme_category === "Certificate Programme") {

          if (_intl === "yes") {
            setDenomination("INTL-CERT");
          } else if (_denomination === "ECWA") {
            setDenomination("ECWA-CERT");
          } else if (_denomination === "Non-ECWA") {
            setDenomination("Non-ECWA-CERT");
          }

        } else if (_programme_category === "Basic English") {

          if (_intl === "yes") {
            setDenomination("INTL-BASIC");
          } else if (_denomination === "ECWA") {
            setDenomination("ECWA-BASIC");
          } else if (_denomination === "Non-ECWA") {
            setDenomination("Non-ECWA-BASIC");
          }

        }

        const res = await fetch(VITE_API_URL + "/api/course/" + arr[i], {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        });
        const result = await res.json();
        if (result.response) {
          if (
            student.programme_category === "Bachelor of Arts Programme" ||
            student.programme_category === "Diploma Programme"
          ) {
            var prog_cat = "UG";
          } else {
            var prog_cat = "PG";
          }
          const res2 = await fetch(
            VITE_API_URL +
              "/api/course-fee/" +
              params.periodId +
              "?prog_category=" +
              prog_cat +
              "&denomination=" +
              denomination(),
            {
              mode: "cors",
              headers: {
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("jetsUser")).token
                }`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              method: "GET",
            }
          );
          const result2 = await res2.json();

          if (result.response.hours === "P/F") {
            var course_amount = 7500;
            var course_hrs = 0;
            var display_course_hrs = "P/F";

            var sub_amount = parseInt(course_amount) * 1;
          } else {
            var course_amount = result2.response.amount;
            var course_hrs = result.response.hours;
            var display_course_hrs = course_hrs;

            var sub_amount = parseInt(course_amount) * parseInt(course_hrs);
          }

          c[arr[i]] = [
            result.response.title,
            display_course_hrs,
            course_amount,
            sub_amount,
          ]; //create object

          total_cu = total_cu + parseInt(course_hrs);
          total_amt = total_amt + parseInt(sub_amount);
        }
      } catch (error) {
        console.error(error);
      }
    }

    setTotalCU(total_cu);
    if (student.special_student_category === "jets staff") {
      setTotalProgFee(parseInt(total_amt) / 2);
    } else {
      setTotalProgFee(total_amt);
    }

    setDetPickedCourses(c);
  };

  var c = {};
  var dropped_total_cu = 0;
  var dropped_total_amt = 0;
  const getDroppedCourseDetails = async (arr) => {
    for (let i = 0; i < arr.length; i++) {
      try {
        const res = await fetch(VITE_API_URL + "/api/course/" + arr[i], {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        });
        const result = await res.json();
        if (result.response) {
          if (
            student.programme_category === "Bachelor of Arts Programme" ||
            student.programme_category === "Diploma Programme"
          ) {
            var prog_cat = "UG";
          } else {
            var prog_cat = "PG";
          }
          const res2 = await fetch(
            VITE_API_URL +
              "/api/course-fee/" +
              params.periodId +
              "?prog_category=" +
              prog_cat +
              "&denomination=" +
              denomination(),
            {
              mode: "cors",
              headers: {
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("jetsUser")).token
                }`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              method: "GET",
            }
          );
          const result2 = await res2.json();

          if (result.response.hours === "P/F") {
            var course_amount = 7500;
            var course_hrs = 0;
            var display_course_hrs = "P/F";

            var sub_amount = parseInt(course_amount) * 1;
          } else {
            var course_amount = result2.response.amount;
            var course_hrs = result.response.hours;
            var display_course_hrs = course_hrs;

            var sub_amount = parseInt(course_amount) * parseInt(course_hrs);
          }

          c[arr[i]] = [
            result.response.title,
            display_course_hrs,
            course_amount,
            sub_amount,
          ]; //create object

          dropped_total_cu = dropped_total_cu + parseInt(course_hrs);
          dropped_total_amt = dropped_total_amt + parseInt(sub_amount);
        }
      } catch (error) {
        console.error(error);
      }
    }

    setDroppedTotalCU(dropped_total_cu);
    if (student.special_student_category === "jets staff") {
      setDroppedTotalProgFee(parseInt(dropped_total_amt) / 2);
    } else {
      setDroppedTotalProgFee(dropped_total_amt);
    }

    setDetDroppedCourses(c);
  };

  var c = {};
  var added_total_cu = 0;
  var added_total_amt = 0;
  const getAddedCourseDetails = async (arr) => {    
    console.log(`Undergraduate: ${prg()}`)
    for (let i = 0; i < arr.length; i++) {
      try {
        const res = await fetch(VITE_API_URL + "/api/course/" + arr[i], {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        });
        const result = await res.json();
        if (result.response) {
          if (
            student.programme_category === "Bachelor of Arts Programme" ||
            student.programme_category === "Diploma Programme"
          ) {
            var prog_cat = "UG";
          } else {
            var prog_cat = "PG";
          }
          const res2 = await fetch(
            VITE_API_URL +
              "/api/course-fee/" +
              params.periodId +
              "?prog_category=" +
              prog_cat +
              "&denomination=" +
              denomination(),
            {
              mode: "cors",
              headers: {
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("jetsUser")).token
                }`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              method: "GET",
            }
          );
          const result2 = await res2.json();

          if (result.response.hours === "P/F") {
            var course_amount = 7500;
            var course_hrs = 0;
            var display_course_hrs = "P/F";

            var sub_amount = parseInt(course_amount) * 1;
          } else {
            var course_amount = result2.response.amount;
            var course_hrs = result.response.hours;
            var display_course_hrs = course_hrs;

            var sub_amount = parseInt(course_amount) * parseInt(course_hrs);
          }

          c[arr[i]] = [
            result.response.title,
            display_course_hrs,
            course_amount,
            sub_amount,
          ]; //create object

          added_total_cu = added_total_cu + parseInt(course_hrs);
          added_total_amt = added_total_amt + parseInt(sub_amount);
        }
      } catch (error) {
        console.error(error);
      }
    }

    setAddedTotalCU(added_total_cu);
    if (student.special_student_category === "jets staff") {
      setAddedTotalProgFee(parseInt(added_total_amt) / 2);
    } else {
      setAddedTotalProgFee(added_total_amt);
    }

    setDetAddedCourses(c);
  };

  const fetchRegistration = async () => {
    try {
      const response = await fetch(
        VITE_API_URL +
          "/api/registration/" +
          params.customId +
          "?period_id=" +
          params.periodId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }
      );

      const result = await response.json();
      if (result.response) {
        return result.response;
      } else {
        if (JSON.parse(localStorage.getItem("jetsUser")).role === "admin") {
          navigate("/admin/semester-registration", { replace: true });
        } else {
          navigate("/student/semester-registration", { replace: true });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showCoursesTable = async (year) => {
    setCoursesLevel(year);

    fetch(VITE_API_URL + "/api/view-courses-by-year/" + year, {
      mode: "cors",
      headers: {
        Authorization: `Bearer ${
          JSON.parse(localStorage.getItem("jetsUser")).token
        }`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "GET",
    })
      .then((res1) => {
        return res1.json();
      })
      .then((data1) => {
        setIsProcessing(false);
        setCourses(data1.response);
        setShowCourses(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const addThisCourse = async (courseCode) => {
    var new_courses = [];

    if (addedCourses) {
      var coursesArray = Object.keys(addedCourses).map(
        (key) => addedCourses[key]
      );
      for (let index = 0; index < coursesArray.length; index++) {
        var added = checkIfAdded(courseCode);
        var picked = checkIfPicked(courseCode);

        if (added || picked) {
          console.log("exist");
        } else {
          new_courses.push(coursesArray[index]);
        }
      }
      new_courses.push(courseCode);
    } else {
      new_courses.push(courseCode);
    }
    var courseData = {
      period_id: params.periodId,
      added_courses: JSON.stringify(new_courses),
    };
    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-registration/" + params.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify(courseData),
        }
      );
      const result = await response.json();
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 600);
      var registration = await fetchRegistration();
      if (registration.added_courses) {
        setAddedCourses(JSON.parse(registration.added_courses));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [warning, setWarning] = createSignal(false);
  const [warningCourseTitle, setWarningCourseTitle] = createSignal("");
  const [warningCourseCode, setWarningCourseCode] = createSignal("");
  const [warningCourseCu, setWarningCourseCu] = createSignal("");
  const [warningCourseAmt, setWarningCourseAmt] = createSignal("");
  const dropThisCourseWarning = async (
    courseCode,
    courseTitle,
    courseCu,
    courseAmt
  ) => {
    setWarning(true);
    setWarningCourseTitle(courseTitle);
    setWarningCourseCode(courseCode);
    setWarningCourseCu(courseCu);
    setWarningCourseAmt(courseAmt);
  };

  const dropThisCourse = async () => {
    // console.log(warningCourseCode(), warningCourseCu(), warningCourseAmt());
    var new_dropped_courses = [];
    if (droppedCourses) {
      var droppedCoursesArray = Object.keys(droppedCourses).map(
        (key) => droppedCourses[key]
      );
      for (let index = 0; index < droppedCoursesArray.length; index++) {
        var dropped = checkIfDropped(warningCourseCode());

        if (dropped) {
          console.log("exist");
        } else {
          new_dropped_courses.push(droppedCoursesArray[index]);
        }
      }
      new_dropped_courses.push(warningCourseCode());
    } else {
      new_dropped_courses.push(warningCourseCode());
    }

    var courseData = {
      period_id: params.periodId,
      dropped_courses: JSON.stringify(new_dropped_courses),
    };

    try {
      const request2 = fetch(
        VITE_API_URL + "/api/edit-registration/" + params.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify(courseData),
        }
      ).then((response) => response.json());
      // xxxx
      //   const response = await fetch(
      //     VITE_API_URL + "/api/edit-registration/" + params.customId,
      //     {
      //       mode: "cors",
      //       headers: {
      //         Authorization: `Bearer ${
      //           JSON.parse(localStorage.getItem("jetsUser")).token
      //         }`,
      //         "Content-Type": "application/json",
      //         Accept: "application/json",
      //
      //       },
      //       method: "PATCH",
      //       body: JSON.stringify(courseData),
      //     }
      //   );
      //   const result = await response.json();
      //   var registration = await fetchRegistration();
      //   setTotalCU(parseInt(totalCU()) - parseInt(courseCu));
      //   setPickedCourses(JSON.parse(registration.pickedCourses));
      //   setShowNotification(true);
      //   setTimeout(() => {
      //     setShowNotification(false);
      //   }, 600);
      // xxxx
      Promise.all([request2]).then(([data2]) => {
        setDropped(true);
        setWarning(false);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const unaddThisCourse = async (courseCode, courseCu, courseAmt) => {
    var addedCoursesArray = Object.keys(addedCourses).map(
      (key) => addedCourses[key]
    );
    const index = addedCoursesArray.indexOf(courseCode);
    const x = addedCoursesArray.splice(index, 1);

    var courseData = {
      period_id: params.periodId,
      added_courses: JSON.stringify(addedCoursesArray),
    };

    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-registration/" + params.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify(courseData),
        }
      );

      const result = await response.json();
      window.location.href =
        "/student/add-drop-form/" + params.periodId + "/" + params.customId;
    } catch (error) {
      console.error(error);
    }
  };

  const undropThisCourse = async (courseCode, courseCu, courseAmt) => {
    var droppedCoursesArray = Object.keys(droppedCourses).map(
      (key) => droppedCourses[key]
    );
    const index = droppedCoursesArray.indexOf(courseCode);
    const x = droppedCoursesArray.splice(index, 1);

    var courseData = {
      period_id: params.periodId,
      dropped_courses: JSON.stringify(droppedCoursesArray),
    };

    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-registration/" + params.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify(courseData),
        }
      );

      const result = await response.json();
      window.location.href =
        "/student/add-drop-form/" + params.periodId + "/" + params.customId;
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfPicked = (val) => {
    var pickedCoursesArray = Object.keys(pickedCourses).map(
      (key) => pickedCourses[key]
    );
    if (pickedCoursesArray.includes(val)) {
      return true;
    } else {
      return false;
    }
  };

  const checkIfDropped = (val) => {
    var droppedCoursesArray = Object.keys(droppedCourses).map(
      (key) => droppedCourses[key]
    );
    if (droppedCoursesArray.includes(val)) {
      return true;
    } else {
      return false;
    }
  };

  const checkIfAdded = (val) => {
    var addedCoursesArray = Object.keys(addedCourses).map(
      (key) => addedCourses[key]
    );
    if (addedCoursesArray.includes(val)) {
      return true;
    } else {
      return false;
    }
  };

  const forwardToDean = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-registration/" + params.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify({
            period_id: params.periodId,
            add_drop_status: "awaiting dean",
          }),
        }
      );

      const result = await response.json();
      // console.log(result.response);
      window.location.href =
        "/student/add-drop-form/" + params.periodId + "/" + params.customId;
    } catch (error) {
      console.error(error);
    }
  };

  const completeAddDrop = async () => {
    setIsProcessing(true);
    var new_bal =
      parseInt(portalWallet()) +
      parseInt(droppedTotalProgFee()) -
      parseInt(addedTotalProgFee());
    // var new_bal = parseInt(portalWallet()) - parseInt(totalProgFee());

    var now = new Date();
    var year = now.getFullYear();
    var year = year.toString();
    var year = year.substring(2, 4);
    if (registrationData().period.semester === "1st") {
      var sem_rep = "A";
    } else {
      var sem_rep = "B";
    }
    var formNumber = "AD" + sem_rep + params.customId + year;
    try {
      const request1 = fetch(
        VITE_API_URL + "/api/edit-portal-wallet/" + params.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify({
            amount: new_bal,
          }),
        }
      ).then((response) => response.json());
      const request2 = fetch(
        VITE_API_URL + "/api/edit-registration/" + params.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify({
            period_id: params.periodId,
            add_drop_status: "completed",
            add_drop_opening_balance: portalWallet(),
            add_drop_closing_balance: new_bal,
            add_drop_form_number: formNumber,
          }),
        }
      ).then((response) => response.json());

      Promise.all([request1, request2]).then(([data1, data2]) => {
        // navigate("/student/downloads", {
        //   replace: true,
        // });
        setAddDropFinished(true);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getOptPassport = (val) => {
    if (val) {
      var pass1 = val.substring(0, 49);
      var pass2 = val.substring(48);
      var passport = pass1 + "c_scale,w_500/f_auto" + pass2;
      return passport;
    } else {
      return "wait";
    }
  };

  const params = useParams();

  const [registrationData] = createResource(registrationFormData);

  return (
    <MetaProvider>
      <Title>Add/Drop Form - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Add/Drop Form on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        {/* {console.log(addDropFinished())} */}
        <Show
          when={addDropFinished()}
          fallback={
            <>
              <Show when={showNotification()}>
                <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
                  <p class="bg-green-300 text-green-800 drop-shadow-xl p-4 rounded w-80 mx-auto text-center">
                    Action was Successful!
                  </p>
                </div>
              </Show>
              <Show
                when={!finished()}
                fallback={
                  <>
                    <Show when={warning()}>
                      <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
                        <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
                          <h2 class="text-center text-blue-900 font-semibold">
                            Warning!
                          </h2>
                          <div class="my-2 border-t border-b border-black py-4 h-5/6 overflow-y-scroll space-y-4">
                            <p>
                              Are you sure you want to drop{" "}
                              <b>
                                {warningCourseCode()} ({warningCourseTitle})
                              </b>
                            </p>
                            <p>
                              <b>Caution:</b>
                              <br />
                              Please seek advice from your HOD or the Dean's
                              office before you drop this course.
                              <br />
                              Note that if you proceed to drop this course and
                              it is approved, you will be removed from the class
                              list and will not be able to re-add it.
                            </p>
                            <div class="text-center space-x-3">
                              <button
                                onClick={() => dropThisCourse()}
                                class="red-btn text-white p-3 hover:opacity-60"
                              >
                                YES! I agree. DROP this course.
                              </button>
                              <button
                                onClick={() =>
                                  (window.location.href =
                                    "/student/add-drop-form/" +
                                    params.periodId +
                                    "/" +
                                    params.customId)
                                }
                                class="gray-btn text-white p-3 hover:opacity-60"
                              >
                                Don't drop this course.
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Show>
                    <Show when={dropped()}>
                      <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
                        <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
                          <h2 class="text-center text-blue-900 font-semibold">
                            Dropped Course
                          </h2>

                          <div class="my-2 border-t border-b py-4 border-black space-y-4">
                            <Success />
                            <p class="text-center">
                              Course was dropped successfully.
                            </p>

                            <div class="text-center space-x-3">
                              <button
                                onClick={() =>
                                  (window.location.href =
                                    "/student/add-drop-form/" +
                                    params.periodId +
                                    "/" +
                                    params.customId)
                                }
                                class="blue-btn text-white p-3 hover:opacity-60"
                              >
                                Ok. Continue.
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Show>
                    <Show when={showCourses()}>
                      <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
                        <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-3 h-5/6 overflow-hidden">
                          <h2 class="text-center text-blue-900 font-semibold">
                            Pick {coursesLevel()} Course(s)
                          </h2>
                          <div class="my-2 border-t border-b border-black py-4 h-5/6 overflow-y-scroll">
                            <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
                              <b class="block">Instruction:</b>
                              <p>You may scroll down to see more courses.</p>
                              <p class="border-t border-blue-900">
                                Click the red button labelled "+" corresponding
                                to the course(s) you wish to pick.
                              </p>
                              <p class="border-t border-blue-900">
                                When a button labelled "+" corresponding to a
                                course is gray it means you have already picked
                                the course.
                              </p>
                            </div>
                            <table
                              cellPadding={0}
                              cellSpacing={0}
                              class="w-full my-4 border"
                            >
                              <thead class="bg-blue-950 text-white border-b border-black">
                                <tr>
                                  <td class="p-1 border-r border-black">#</td>
                                  <td class="p-1 border-r border-black">
                                    Code
                                  </td>
                                  <td class="p-1 border-r border-black">
                                    Title
                                  </td>
                                  <td class="p-1 border-r border-black">CU</td>
                                  <td class="p-1">?</td>
                                </tr>
                              </thead>
                              <tbody>
                                <Show
                                  when={courses.loading}
                                  fallback={
                                    <Show when={courses}>
                                      <Show
                                        when={courses.length > 0}
                                        fallback={
                                          <tr class="">
                                            <td
                                              class="p-3 text-center"
                                              colSpan={5}
                                            >
                                              No record found.
                                            </td>
                                          </tr>
                                        }
                                      >
                                        <For each={courses}>
                                          {(course, i) => (
                                            <tr class="even:bg-blue-200 odd:bg-white even:border-y border-black">
                                              <td class="p-1 border-r border-black font-semibold">
                                                {i() + 1}.
                                              </td>
                                              <td class="p-1 border-r border-black">
                                                {course.code}
                                              </td>
                                              <td class="p-1 border-r border-black">
                                                {course.title}
                                              </td>
                                              <td class="p-1 border-r border-black">
                                                {course.hours}
                                              </td>
                                              <td class="p-1 sm:space-x-1 sm:flex">
                                                <Switch>
                                                  <Match
                                                    when={
                                                      checkIfPicked(
                                                        course.code
                                                      ) ||
                                                      checkIfAdded(course.code)
                                                    }
                                                  >
                                                    <button
                                                      disabled
                                                      class="gray2-btn py-1 px-2 text-white cursor-not-allowed"
                                                    >
                                                      +
                                                    </button>
                                                  </Match>
                                                  <Match
                                                    when={
                                                      !checkIfPicked(
                                                        course.code
                                                      ) ||
                                                      !checkIfAdded(course.code)
                                                    }
                                                  >
                                                    <button
                                                      onClick={() => {
                                                        addThisCourse(
                                                          course.code
                                                        );
                                                      }}
                                                      class="green-btn py-1 px-2 text-white hover:opacity-60"
                                                    >
                                                      +
                                                    </button>
                                                  </Match>
                                                </Switch>
                                              </td>
                                            </tr>
                                          )}
                                        </For>
                                      </Show>
                                    </Show>
                                  }
                                >
                                  <tr class="">
                                    <td class="p-3 text-center" colSpan={5}>
                                      Fetching.. .
                                    </td>
                                  </tr>
                                </Show>
                              </tbody>
                            </table>
                          </div>
                          <div class="text-right space-x-3">
                            <button
                              onClick={() =>
                                (window.location.href =
                                  "/student/add-drop-form/" +
                                  params.periodId +
                                  "/" +
                                  params.customId)
                              }
                              class="red-btn text-white p-3 hover:opacity-60"
                            >
                              Save & Continue
                            </button>
                          </div>
                        </div>
                      </div>
                    </Show>
                    <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
                      <h2 class="text-lg font-semibold text-center border-b border-red-200">
                        Student Add/Drop Form
                      </h2>
                      <Show
                        when={
                          !registrationData.loading &&
                          JSON.parse(localStorage.getItem("jetsUser")).role ===
                            "student"
                        }
                      >
                        <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
                          <Switch>
                            <Match
                              when={
                                registrationData().addDropStatus() === "started"
                              }
                            >
                              <b class="block">
                                Add/Drop Status:{" "}
                                <u class="text-red-700 font-semibold uppercase">
                                  Started
                                </u>
                              </b>
                              <b class="text-blue-900">Note:</b>
                              <br />
                              You have began your Add/Drop. Please ensure to
                              drop or add only the appropriate courses for the
                              semester.
                              <br />
                              When satisfied with your dropped or/and added
                              courses, forward to DPAA's office for approval.
                            </Match>
                            <Match
                              when={
                                registrationData().addDropStatus() ===
                                "awaiting dean"
                              }
                            >
                              <b class="block">
                                Add/Drop Status:{" "}
                                <u class="text-red-700 font-semibold uppercase">
                                  Awaiting DPAA's Office
                                </u>
                              </b>
                              <b class="text-blue-900">Note:</b>
                              <br />
                              Your add/drop is at the Dean's Office and awaiting
                              approval. This should normally take 24 hours or
                              less.
                              <br />
                              When approved or disapproved, you'll be notified
                              via SMS. However, if you don't get notified after
                              24 hours please check/reload this page again.
                            </Match>
                            <Match
                              when={
                                registrationData().addDropStatus() ===
                                "disapproved"
                              }
                            >
                              <b class="block">
                                Add/Drop Status:{" "}
                                <u class="text-red-700 font-semibold uppercase">
                                  {registrationData().addDropStatus()}
                                </u>
                              </b>
                              <b class="text-blue-900">Note:</b>
                              <br />
                              Your add/drop was Disapproved.
                              <br />
                              <b class="text-blue-900">Reason(s):</b>
                              <br />
                              <p class="bg-black border-l-8 border-red-600 text-white rounded p-2">
                                {registrationData().addDropComment()}
                              </p>
                            </Match>
                            <Match
                              when={
                                registrationData().addDropStatus() ===
                                "incomplete"
                              }
                            >
                              <b class="block">
                                Add/Drop Status:{" "}
                                <u class="text-red-700 font-semibold uppercase">
                                  Incomplete Add/Drop
                                </u>
                              </b>
                              <b class="text-blue-900">Note:</b>
                              <br />
                              Your Add/Drop has been approved BUT it is
                              INCOMPLETE because you are yet to submit and print
                              this Add/Drop Form. Scroll to the bottom of this
                              page to do that now.
                            </Match>
                          </Switch>
                        </div>
                      </Show>
                      <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4">
                        <Show
                          when={registrationData.loading}
                          fallback={
                            <div class="space-y-6">
                              <div class="overflow-x-auto">
                                <table
                                  cellPadding={0}
                                  cellSpacing={0}
                                  class="w-full"
                                >
                                  <thead>
                                    <tr class="bg-white border-b border-black text-blue-900">
                                      <th class="p-1 text-left" colSpan={5}>
                                        :: Personal Data
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr class="border-b border-black">
                                      <td class="p-4">
                                        <b>Year of Admission:</b>&nbsp;
                                        <span>
                                          {
                                            registrationData().student
                                              .year_of_admission
                                          }
                                        </span>
                                      </td>

                                      <td class="p-4">
                                        <b>Today's Date:</b>&nbsp;
                                        <span>
                                          {new Date().getDate()}-
                                          {new Date().getMonth() + 1}-
                                          {new Date().getFullYear()}
                                        </span>
                                      </td>
                                      <td class="p-4">
                                        <b>Academic Session:</b>&nbsp;
                                        <span>
                                          {registrationData().period.session}
                                        </span>
                                      </td>
                                      <td class="p-4">
                                        <b>Semester(s):</b>&nbsp;
                                        <span class="uppercase">
                                          {registrationData().period.semester}
                                        </span>
                                      </td>
                                      <td class="p-4" rowSpan={4}>
                                        <div class="w-40 max-h-40 overflow-hidden rounded-md">
                                          <img
                                            src={getOptPassport(
                                              registrationData().user
                                                .passport_url
                                            )}
                                            class="w-full"
                                          />
                                        </div>
                                      </td>
                                    </tr>
                                    <tr class="border-b border-black">
                                      <td class="p-4">
                                        <b>Name:</b>&nbsp;
                                        <b class="uppercase">
                                          {registrationData().user.surname}
                                        </b>{" "}
                                        <span>
                                          {registrationData().user.first_name}
                                        </span>{" "}
                                        <span>
                                          {registrationData().user.other_names}
                                        </span>
                                      </td>
                                      <td class="p-4">
                                        <b>Gender:</b>&nbsp;
                                        <span class="uppercase">
                                          {registrationData().user.gender}
                                        </span>
                                      </td>
                                      <td class="p-4">
                                        <b>Phone Number:</b>&nbsp;
                                        <span>
                                          {registrationData().user.phone_number}
                                        </span>
                                      </td>
                                      <td class="p-4">
                                        <b>Email:</b>&nbsp;
                                        <span>
                                          {registrationData().student.email}
                                        </span>
                                      </td>
                                    </tr>
                                    <tr class="border-b border-black">
                                      <td class="p-4">
                                        <b>Ledger No.:</b>&nbsp;
                                        {
                                          registrationData().student
                                            .ledger_number
                                        }
                                      </td>
                                      <td class="p-4">
                                        <b>Mat. No.:</b>&nbsp;
                                        <span class="uppercase">
                                          {
                                            registrationData().student
                                              .matriculation_number
                                          }
                                        </span>
                                      </td>
                                      <td class="p-4">
                                        <b>Special St. Cat:</b>&nbsp;
                                        <span class="capitalize">
                                          {
                                            registrationData().student
                                              .special_student_category
                                          }
                                        </span>
                                      </td>
                                      <td class="p-4">
                                        <b>Denomination:</b>&nbsp;
                                        <span>
                                          {
                                            registrationData().student
                                              .denomination
                                          }
                                        </span>
                                      </td>
                                    </tr>
                                    <tr class="border-b border-black">
                                      <td class="p-4">
                                        <b>Programme:</b>&nbsp;
                                        {registrationData().student.programme}
                                      </td>
                                      <td class="p-4">
                                        <b>Mode of Study:</b>&nbsp;
                                        {modeOfStudy()}
                                      </td>
                                      <td class="p-4">
                                        <b>Affiliation Status.:</b>&nbsp;
                                        <span class="uppercase">
                                          {
                                            registrationData().student
                                              .affiliation_status
                                          }
                                        </span>
                                      </td>
                                      <td class="p-4">
                                        <b>Current Level:</b>&nbsp;
                                        <span>
                                          {
                                            registrationData().studentReg
                                              .current_level
                                          }
                                          &nbsp;
                                          <span class="uppercase">
                                            (
                                            {
                                              registrationData().studentReg
                                                .fresh_returning
                                            }{" "}
                                            Student)
                                          </span>
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div class="overflow-x-auto">
                                <table
                                  cellPadding={0}
                                  cellSpacing={0}
                                  class="w-full"
                                >
                                  <thead>
                                    <tr class="bg-white border-b border-black text-blue-900">
                                      <th class="p-1 text-left" colSpan={7}>
                                        :: ALREADY REGISTERED COURSES
                                      </th>
                                    </tr>
                                    <tr class="border-b border-black bg-gray-300">
                                      <th class="p-4 text-left border-r border-black">
                                        Sn.
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Title
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Code
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        CH
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Unit Cost
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Amount
                                      </th>
                                      <th class="p-4 text-left">?</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <Show when={pickedCourses}>
                                      <For each={pickedCourses}>
                                        {(course, i) => (
                                          <Show
                                            fallback={
                                              <tr class="line-through bg-purple-400 border-b border-black">
                                                <td class="p-4 border-r border-black font-semibold">
                                                  {i() + 1}.
                                                </td>
                                                <td class="p-4 border-r border-black">
                                                  <Show
                                                    when={
                                                      detPickedCourses[course]
                                                    }
                                                    fallback={<>Fetching.. .</>}
                                                  >
                                                    {
                                                      detPickedCourses[
                                                        course
                                                      ][0]
                                                    }
                                                  </Show>
                                                </td>
                                                <td class="p-4 border-r border-black">
                                                  <Show
                                                    when={course}
                                                    fallback={<>Fetching.. .</>}
                                                  >
                                                    {course}
                                                  </Show>
                                                </td>
                                                <td class="p-4 border-r border-black">
                                                  <Show
                                                    when={
                                                      detPickedCourses[course]
                                                    }
                                                    fallback={<>Fetching.. .</>}
                                                  >
                                                    {
                                                      detPickedCourses[
                                                        course
                                                      ][1]
                                                    }
                                                  </Show>
                                                </td>
                                                <td class="p-4 border-r border-black">
                                                  <Show
                                                    when={
                                                      detPickedCourses[course]
                                                    }
                                                    fallback={<>Fetching.. .</>}
                                                  >
                                                    {formatter.format(
                                                      detPickedCourses[
                                                        course
                                                      ][2]
                                                    )}
                                                  </Show>
                                                </td>
                                                <td class="p-4 border-r border-black">
                                                  <Show
                                                    when={
                                                      detPickedCourses[course]
                                                    }
                                                    fallback={<>Fetching.. .</>}
                                                  >
                                                    {formatter.format(
                                                      detPickedCourses[
                                                        course
                                                      ][3]
                                                    )}
                                                  </Show>
                                                </td>
                                                <td class="p-4">
                                                  <button
                                                    disabled
                                                    class="gray-btn py-1 px-2 text-white"
                                                  >
                                                    To be Dropped
                                                  </button>
                                                </td>
                                              </tr>
                                            }
                                            when={!checkIfDropped(course)}
                                          >
                                            <tr class="border-b border-black">
                                              <td class="p-4 border-r border-black font-semibold">
                                                {i() + 1}.
                                              </td>
                                              <td class="p-4 border-r border-black">
                                                <Show
                                                  when={
                                                    detPickedCourses[course]
                                                  }
                                                  fallback={<>Fetching.. .</>}
                                                >
                                                  {detPickedCourses[course][0]}
                                                </Show>
                                              </td>
                                              <td class="p-4 border-r border-black">
                                                <Show
                                                  when={course}
                                                  fallback={<>Fetching.. .</>}
                                                >
                                                  {course}
                                                </Show>
                                              </td>
                                              <td class="p-4 border-r border-black">
                                                <Show
                                                  when={
                                                    detPickedCourses[course]
                                                  }
                                                  fallback={<>Fetching.. .</>}
                                                >
                                                  {detPickedCourses[course][1]}
                                                </Show>
                                              </td>
                                              <td class="p-4 border-r border-black">
                                                <Show
                                                  when={
                                                    detPickedCourses[course]
                                                  }
                                                  fallback={<>Fetching.. .</>}
                                                >
                                                  {formatter.format(
                                                    detPickedCourses[course][2]
                                                  )}
                                                </Show>
                                              </td>
                                              <td class="p-4 border-r border-black">
                                                <Show
                                                  when={
                                                    detPickedCourses[course]
                                                  }
                                                  fallback={<>Fetching.. .</>}
                                                >
                                                  {formatter.format(
                                                    detPickedCourses[course][3]
                                                  )}
                                                </Show>
                                              </td>
                                              <td class="p-4">
                                                <Show
                                                  when={
                                                    JSON.parse(
                                                      localStorage.getItem(
                                                        "jetsUser"
                                                      )
                                                    ).role === "student" &&
                                                    (registrationData().addDropStatus() ===
                                                      "started" ||
                                                      registrationData().addDropStatus() ===
                                                        "disapproved")
                                                  }
                                                >
                                                  <button
                                                    onClick={() => {
                                                      dropThisCourseWarning(
                                                        course,
                                                        detPickedCourses[
                                                          course
                                                        ][0],
                                                        detPickedCourses[
                                                          course
                                                        ][1],
                                                        detPickedCourses[
                                                          course
                                                        ][3]
                                                      );
                                                    }}
                                                    class="red-btn py-1 px-2 text-white hover:opacity-60"
                                                  >
                                                    Drop Course
                                                  </button>
                                                </Show>
                                              </td>
                                            </tr>
                                          </Show>
                                        )}
                                      </For>
                                      <tr class="border-b border-black">
                                        <td
                                          class="font-semibold p-4 border-r border-black"
                                          colSpan={3}
                                        >
                                          Sub Total{" "}
                                          <Show
                                            when={
                                              registrationData().student
                                                .special_student_category ===
                                              "jets staff"
                                            }
                                          >
                                            (ETSK Staff)
                                          </Show>
                                        </td>
                                        <td class="font-semibold p-4 border-r border-black">
                                          {totalCU()}
                                        </td>
                                        <td class="p-4 border-r border-black">
                                          &nbsp;
                                        </td>
                                        <td class="font-semibold p-4">
                                          <Show
                                            when={
                                              registrationData().student
                                                .special_student_category ===
                                              "jets staff"
                                            }
                                          >
                                            <>
                                              <span class="line-through">
                                                {formatter.format(
                                                  parseInt(totalProgFee()) * 2
                                                )}
                                              </span>
                                              <br />
                                            </>
                                          </Show>
                                          {formatter.format(
                                            parseInt(totalProgFee())
                                          )}
                                        </td>
                                      </tr>
                                    </Show>
                                  </tbody>
                                </table>
                              </div>
                              <div class="overflow-x-auto">
                                <table
                                  cellPadding={0}
                                  cellSpacing={0}
                                  class="w-full"
                                >
                                  <thead>
                                    <tr class="bg-white border-b border-black text-blue-900">
                                      <th class="p-1 text-left" colSpan={7}>
                                        :: COURSE(S) TO BE DROPPED
                                      </th>
                                    </tr>
                                    <tr class="border-b border-black bg-gray-300">
                                      <th class="p-4 text-left border-r border-black">
                                        Sn.
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Title
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Code
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        CH
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Unit Cost
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Amount
                                      </th>
                                      <th class="p-4 text-left">?</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <Show
                                      fallback={
                                        <tr class="border-b border-black">
                                          <td
                                            colSpan={7}
                                            class="text-center p-4"
                                          >
                                            No course(s) dropped.
                                          </td>
                                        </tr>
                                      }
                                      when={droppedCourses.length > 0}
                                    >
                                      <For each={droppedCourses}>
                                        {(course, i) => (
                                          <tr class="border-b border-black">
                                            <td class="p-4 border-r border-black font-semibold">
                                              {i() + 1}.
                                            </td>
                                            <td class="p-4 border-r border-black">
                                              <Show
                                                when={detDroppedCourses[course]}
                                                fallback={<>Fetching.. .</>}
                                              >
                                                {detDroppedCourses[course][0]}
                                              </Show>
                                            </td>
                                            <td class="p-4 border-r border-black">
                                              <Show
                                                when={course}
                                                fallback={<>Fetching.. .</>}
                                              >
                                                {course}
                                              </Show>
                                            </td>
                                            <td class="p-4 border-r border-black">
                                              <Show
                                                when={detDroppedCourses[course]}
                                                fallback={<>Fetching.. .</>}
                                              >
                                                {detDroppedCourses[course][1]}
                                              </Show>
                                            </td>
                                            <td class="p-4 border-r border-black">
                                              <Show
                                                when={detDroppedCourses[course]}
                                                fallback={<>Fetching.. .</>}
                                              >
                                                {formatter.format(
                                                  detDroppedCourses[course][2]
                                                )}
                                              </Show>
                                            </td>
                                            <td class="p-4 border-r border-black">
                                              <Show
                                                when={detDroppedCourses[course]}
                                                fallback={<>Fetching.. .</>}
                                              >
                                                {formatter.format(
                                                  detDroppedCourses[course][3]
                                                )}
                                              </Show>
                                            </td>
                                            <td class="p-4">
                                              <Show
                                                where={
                                                  JSON.parse(
                                                    localStorage.getItem(
                                                      "jetsUser"
                                                    )
                                                  ).surname === "student"
                                                }
                                              >
                                                <button
                                                  onClick={() => {
                                                    undropThisCourse(
                                                      course,
                                                      detPickedCourses[
                                                        course
                                                      ][1],
                                                      detPickedCourses[
                                                        course
                                                      ][2]
                                                    );
                                                  }}
                                                  class="red-btn py-1 px-2 text-white hover:opacity-60"
                                                >
                                                  -
                                                </button>
                                              </Show>
                                            </td>
                                          </tr>
                                        )}
                                      </For>
                                      <tr class="border-b border-black">
                                        <td
                                          class="font-semibold p-4 border-r border-black"
                                          colSpan={3}
                                        >
                                          Sub Total{" "}
                                          <Show
                                            when={
                                              registrationData().student
                                                .special_student_category ===
                                              "jets staff"
                                            }
                                          >
                                            (ETSK Staff)
                                          </Show>
                                        </td>
                                        <td class="font-semibold p-4 border-r border-black">
                                          {droppedTotalCU()}
                                        </td>
                                        <td class="p-4 border-r border-black">
                                          &nbsp;
                                        </td>
                                        <td class="font-semibold p-4">
                                          <Show
                                            when={
                                              registrationData().student
                                                .special_student_category ===
                                              "jets staff"
                                            }
                                          >
                                            <>
                                              <span class="line-through">
                                                {formatter.format(
                                                  parseInt(
                                                    droppedTotalProgFee()
                                                  ) * 2
                                                )}
                                              </span>
                                              <br />
                                            </>
                                          </Show>
                                          {formatter.format(
                                            parseInt(droppedTotalProgFee())
                                          )}
                                        </td>
                                      </tr>
                                    </Show>
                                  </tbody>
                                </table>
                              </div>
                              <div class="overflow-x-auto">
                                <table
                                  cellPadding={0}
                                  cellSpacing={0}
                                  class="w-full"
                                >
                                  <thead>
                                    <tr class="bg-white border-b border-black text-blue-900">
                                      <th class="p-1 text-left" colSpan={7}>
                                        :: ADDED COURSE(S)
                                      </th>
                                    </tr>
                                    <tr class="border-b border-black bg-gray-300">
                                      <th class="p-4 text-left border-r border-black">
                                        Sn.
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Title
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Code
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        CH
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Unit Cost
                                      </th>
                                      <th class="p-4 text-left border-r border-black">
                                        Amount
                                      </th>
                                      <th class="p-4 text-left">?</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <Show
                                      fallback={
                                        <tr class="border-b border-black">
                                          <td
                                            colSpan={7}
                                            class="text-center p-4"
                                          >
                                            No course(s) added.
                                          </td>
                                        </tr>
                                      }
                                      when={addedCourses.length > 0}
                                    >
                                      <For each={addedCourses}>
                                        {(course, i) => (
                                          <tr class="border-b border-black">
                                            <td class="p-4 border-r border-black font-semibold">
                                              {i() + 1}.
                                            </td>
                                            <td class="p-4 border-r border-black">
                                              <Show
                                                when={detAddedCourses[course]}
                                                fallback={<>Fetching.. .</>}
                                              >
                                                {detAddedCourses[course][0]}
                                              </Show>
                                            </td>
                                            <td class="p-4 border-r border-black">
                                              <Show
                                                when={course}
                                                fallback={<>Fetching.. .</>}
                                              >
                                                {course}
                                              </Show>
                                            </td>
                                            <td class="p-4 border-r border-black">
                                              <Show
                                                when={detAddedCourses[course]}
                                                fallback={<>Fetching.. .</>}
                                              >
                                                {detAddedCourses[course][1]}
                                              </Show>
                                            </td>
                                            <td class="p-4 border-r border-black">
                                              <Show
                                                when={detAddedCourses[course]}
                                                fallback={<>Fetching.. .</>}
                                              >
                                                {formatter.format(
                                                  detAddedCourses[course][2]
                                                )}
                                              </Show>
                                            </td>
                                            <td class="p-4 border-r border-black">
                                              <Show
                                                when={detAddedCourses[course]}
                                                fallback={<>Fetching.. .</>}
                                              >
                                                {formatter.format(
                                                  detAddedCourses[course][3]
                                                )}
                                              </Show>
                                            </td>
                                            <td class="p-4">
                                              <Show
                                                when={
                                                  JSON.parse(
                                                    localStorage.getItem(
                                                      "jetsUser"
                                                    )
                                                  ).role === "student"
                                                }
                                              >
                                                <button
                                                  onClick={() => {
                                                    unaddThisCourse(
                                                      course,
                                                      detAddedCourses[
                                                        course
                                                      ][1],
                                                      detAddedCourses[course][2]
                                                    );
                                                  }}
                                                  class="red-btn py-1 px-2 text-white hover:opacity-60"
                                                >
                                                  -
                                                </button>
                                              </Show>
                                            </td>
                                          </tr>
                                        )}
                                      </For>
                                      <tr class="border-b border-black">
                                        <td
                                          class="font-semibold p-4 border-r border-black"
                                          colSpan={3}
                                        >
                                          Sub Total{" "}
                                          <Show
                                            when={
                                              registrationData().student
                                                .special_student_category ===
                                              "jets staff"
                                            }
                                          >
                                            (ETSK Staff)
                                          </Show>
                                        </td>
                                        <td class="font-semibold p-4 border-r border-black">
                                          {addedTotalCU()}
                                        </td>
                                        <td class="p-4 border-r border-black">
                                          &nbsp;
                                        </td>
                                        <td class="font-semibold p-4">
                                          <Show
                                            when={
                                              registrationData().student
                                                .special_student_category ===
                                              "jets staff"
                                            }
                                          >
                                            <>
                                              <span class="line-through">
                                                {formatter.format(
                                                  parseInt(
                                                    addedTotalProgFee()
                                                  ) * 2
                                                )}
                                              </span>
                                              <br />
                                            </>
                                          </Show>
                                          {formatter.format(
                                            parseInt(addedTotalProgFee())
                                          )}
                                        </td>
                                      </tr>
                                    </Show>
                                  </tbody>
                                </table>
                              </div>
                              <Show
                                when={
                                  JSON.parse(localStorage.getItem("jetsUser"))
                                    .role === "student" &&
                                  (registrationData().addDropStatus() ===
                                    "started" ||
                                    registrationData().addDropStatus() ===
                                      "disapproved")
                                }
                              >
                                <div class="overflow-x-auto">
                                  <table
                                    cellPadding={0}
                                    cellSpacing={0}
                                    class="w-full"
                                  >
                                    <thead>
                                      <tr class="bg-white border-b border-black text-blue-900">
                                        <th class="p-1 text-left" colSpan={3}>
                                          :: ADD COURSE(S)
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody class="bg-gray-400">
                                      <tr>
                                        <td class="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                          <Show
                                            when={
                                              registrationData().studentReg
                                                .current_level === "1-BA" ||
                                              registrationData().studentReg
                                                .current_level ===
                                                "1-Diploma" ||
                                              registrationData().studentReg
                                                .current_level === "2-BA" ||
                                              registrationData().studentReg
                                                .current_level ===
                                                "2-Diploma" ||
                                              registrationData().studentReg
                                                .current_level === "3-BA" ||
                                              registrationData().studentReg
                                                .current_level ===
                                                "3-Diploma" ||
                                              registrationData().studentReg
                                                .current_level === "4-BA" ||
                                              registrationData().studentReg
                                                .current_level === "5" ||
                                              registrationData().studentReg
                                                .current_level === "6" ||
                                              registrationData().studentReg
                                                .current_level === "7"
                                            }
                                          >
                                            <button
                                              class="blue-btn p-3 hover:opacity-60"
                                              onClick={() =>
                                                showCoursesTable(1)
                                              }
                                            >
                                              Year 1 Course(s)
                                            </button>
                                          </Show>
                                          <Show
                                            when={
                                              registrationData().studentReg
                                                .current_level === "2-BA" ||
                                              registrationData().studentReg
                                                .current_level ===
                                                "2-Diploma" ||
                                              registrationData().studentReg
                                                .current_level === "3-BA" ||
                                              registrationData().studentReg
                                                .current_level ===
                                                "3-Diploma" ||
                                              registrationData().studentReg
                                                .current_level === "4-BA" ||
                                              registrationData().studentReg
                                                .current_level === "5" ||
                                              registrationData().studentReg
                                                .current_level === "6" ||
                                              registrationData().studentReg
                                                .current_level === "7"
                                            }
                                          >
                                            <button
                                              class="blue-btn p-3 hover:opacity-60"
                                              onClick={() =>
                                                showCoursesTable(2)
                                              }
                                            >
                                              Year 2 Course(s)
                                            </button>
                                          </Show>
                                          <Show
                                            when={
                                              registrationData().studentReg
                                                .current_level === "2-BA" ||
                                              registrationData().studentReg
                                                .current_level === "3-BA" ||
                                              registrationData().studentReg
                                                .current_level ===
                                                "3-Diploma" ||
                                              registrationData().studentReg
                                                .current_level === "4-BA" ||
                                              registrationData().studentReg
                                                .current_level === "5" ||
                                              registrationData().studentReg
                                                .current_level === "6" ||
                                              registrationData().studentReg
                                                .current_level === "7"
                                            }
                                          >
                                            <button
                                              class="blue-btn p-3 hover:opacity-60"
                                              onClick={() =>
                                                showCoursesTable(3)
                                              }
                                            >
                                              Year 3 Course(s)
                                            </button>
                                          </Show>
                                          <Show
                                            when={
                                              registrationData().studentReg
                                                .current_level === "3-BA" ||
                                              registrationData().studentReg
                                                .current_level === "4-BA" ||
                                              registrationData().studentReg
                                                .current_level === "5" ||
                                              registrationData().studentReg
                                                .current_level === "6" ||
                                              registrationData().studentReg
                                                .current_level === "7"
                                            }
                                          >
                                            <button
                                              class="blue-btn p-3 hover:opacity-60"
                                              onClick={() =>
                                                showCoursesTable(4)
                                              }
                                            >
                                              Year 4 Course(s)
                                            </button>
                                          </Show>
                                          <Show
                                            when={
                                              registrationData().studentReg
                                                .current_level === "5" ||
                                              registrationData().studentReg
                                                .current_level === "6" ||
                                              registrationData().studentReg
                                                .current_level === "7"
                                            }
                                          >
                                            <button
                                              class="blue-btn p-3 hover:opacity-60"
                                              onClick={() =>
                                                showCoursesTable(5)
                                              }
                                            >
                                              Year 5 Course(s)
                                            </button>
                                          </Show>
                                          <Show
                                            when={
                                              registrationData().studentReg
                                                .current_level === "6" ||
                                              registrationData().studentReg
                                                .current_level === "7"
                                            }
                                          >
                                            <button
                                              class="blue-btn p-3 hover:opacity-60"
                                              onClick={() =>
                                                showCoursesTable(6)
                                              }
                                            >
                                              Year 6 Course(s)
                                            </button>
                                          </Show>
                                          <Show
                                            when={
                                              registrationData().studentReg
                                                .current_level === "7"
                                            }
                                          >
                                            <button
                                              class="blue-btn p-3 hover:opacity-60"
                                              onClick={() =>
                                                showCoursesTable(7)
                                              }
                                            >
                                              Year 7 Course(s)
                                            </button>
                                          </Show>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </Show>

                              <Show
                                when={
                                  (addedTotalProgFee() > 0 ||
                                    droppedTotalProgFee() > 0) &&
                                  (registrationData().addDropStatus() ===
                                    "started" ||
                                    registrationData().addDropStatus() ===
                                      "disapproved")
                                }
                              >
                                <div class="overflow-x-auto">
                                  <table
                                    cellPadding={0}
                                    cellSpacing={0}
                                    class="w-full"
                                  >
                                    <thead>
                                      <tr class="bg-white border-b border-black text-blue-900">
                                        <th class="p-1 text-left" colSpan={3}>
                                          :: FOR APPROVAL
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td class="p-3 text-sm">
                                          <span class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5 block">
                                            <b>
                                              Have you added or/and dropped all
                                              the appropriate courses for the
                                              semester?
                                            </b>
                                            <br />
                                            <Show
                                              when={
                                                registrationData().addDropStatus() ===
                                                "disapproved"
                                              }
                                            >
                                              <b>
                                                Have you effected the needed
                                                correction(s)?
                                              </b>
                                            </Show>
                                            <br />
                                            If YES please click on the red
                                            colored button labelled 'Forward for
                                            Approval' below to forward your
                                            Add/Drop for approval.
                                            <br />
                                            <br />
                                            <b class="text-blue-900">Note:</b>
                                            <br />
                                            <b>DO NOT</b> click on this button
                                            if you are unsatisfied with or
                                            unsure of the courses you have added
                                            or/and dropped.{" "}
                                            <b>
                                              If you need help please contact
                                              the relevant office.
                                            </b>
                                          </span>
                                        </td>
                                      </tr>
                                      <tr class=" border-b border-black">
                                        <td class="p-4">
                                          <Show
                                            when={isProcessing()}
                                            fallback={
                                              <button
                                                onClick={forwardToDean}
                                                class="red-btn p-2 hover:opacity-60"
                                              >
                                                <Show
                                                  when={
                                                    registrationData().addDropStatus() ===
                                                    "disapproved"
                                                  }
                                                  fallback={
                                                    <>Forward for Approval</>
                                                  }
                                                >
                                                  Re-Forward for Approval
                                                </Show>
                                              </button>
                                            }
                                          >
                                            <button
                                              disabled
                                              class="gray2-btn p-2 cursor-not-allowed animate-pulse"
                                            >
                                              Forwarding.. .
                                            </button>
                                          </Show>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </Show>
                              <Show
                                when={
                                  registrationData().addDropStatus() ===
                                  "incomplete"
                                }
                              >
                                <div class="overflow-x-auto">
                                  <table
                                    cellPadding={0}
                                    cellSpacing={0}
                                    class="w-full"
                                  >
                                    <thead>
                                      <tr class="bg-white border-b border-black text-blue-900">
                                        <th class="p-1 text-left">
                                          :: SUMMARY OF FEES
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr class="border-b border-black">
                                        <td class="p-4">
                                          <span class="flex justify-between">
                                            <span>
                                              Portal Wallet:{" "}
                                              <b>
                                                {formatter.format(
                                                  parseInt(portalWallet())
                                                )}
                                              </b>
                                            </span>
                                            <span class="">
                                              Total Charges:{" "}
                                              <b>
                                                {formatter.format(
                                                  parseInt(addedTotalProgFee())
                                                )}
                                              </b>
                                            </span>
                                            <span>
                                              Amount to Add:{" "}
                                              <Show
                                                when={
                                                  parseInt(portalWallet()) +
                                                    parseInt(
                                                      droppedTotalProgFee()
                                                    ) >=
                                                  parseInt(addedTotalProgFee())
                                                }
                                                fallback={
                                                  <b>
                                                    {formatter.format(
                                                      parseInt(
                                                        addedTotalProgFee()
                                                      ) -
                                                        (parseInt(
                                                          portalWallet()
                                                        ) +
                                                          parseInt(
                                                            droppedTotalProgFee()
                                                          ))
                                                    )}
                                                  </b>
                                                }
                                              >
                                                <b>{formatter.format(0)}</b>
                                              </Show>
                                            </span>
                                          </span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                <Show
                                  when={
                                    JSON.parse(localStorage.getItem("jetsUser"))
                                      .role === "student"
                                  }
                                >
                                  <div class="overflow-x-auto">
                                    <table
                                      cellPadding={0}
                                      cellSpacing={0}
                                      class="w-full"
                                    >
                                      <thead>
                                        <tr class="bg-white border-b border-black text-blue-900">
                                          <th class="p-1 text-left">
                                            :: SUBMIT & PRINT
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr class="border-b border-black">
                                          <Show
                                            when={
                                              portalWallet() !== null &&
                                              addedTotalProgFee() !== null &&
                                              droppedTotalProgFee() !== null
                                            }
                                          >
                                            <td class="p-4">
                                              <Show
                                                when={
                                                  // registrationData().undertakingStatus() ===
                                                  //   "yes" ||
                                                  parseInt(portalWallet()) +
                                                    parseInt(
                                                      droppedTotalProgFee()
                                                    ) >=
                                                  parseInt(addedTotalProgFee())
                                                }
                                                fallback={
                                                  <span class="block bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
                                                    You can't complete (submit
                                                    and print) your registration
                                                    because your portal wallet
                                                    is insufficient. Please
                                                    proceed to make payment and
                                                    return to this page. For
                                                    details on how to make
                                                    payment check the{" "}
                                                    <A
                                                      class="underline hover:opacity-60"
                                                      href="/student/portal-wallet"
                                                    >
                                                      Portal Wallet page
                                                    </A>
                                                    .
                                                  </span>
                                                }
                                              >
                                                <span class="block bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
                                                  Click on the button below to
                                                  complete (submit and print)
                                                  your add/drop.
                                                  <br />
                                                  <Show
                                                    when={isProcessing()}
                                                    fallback={
                                                      <button
                                                        onClick={() =>
                                                          completeAddDrop()
                                                        }
                                                        class="green-btn p-3 text-center hover:opacity-60"
                                                      >
                                                        Submit & Print My
                                                        Add/Drop
                                                      </button>
                                                    }
                                                  >
                                                    <button
                                                      disabled
                                                      class="gray2-btn cursor-wait p-3 text-center"
                                                    >
                                                      Processing.. .
                                                    </button>
                                                  </Show>
                                                </span>
                                              </Show>
                                            </td>
                                          </Show>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </Show>
                              </Show>
                              <Show
                                when={
                                  JSON.parse(localStorage.getItem("jetsUser"))
                                    .role === "admin"
                                }
                              >
                                <div class="overflow-x-auto">
                                  <table
                                    cellPadding={0}
                                    cellSpacing={0}
                                    class="w-full"
                                  >
                                    <thead>
                                      <tr class="bg-white border-b border-black text-blue-900">
                                        <th class="p-1 text-left" colSpan={6}>
                                          :: PROCESS FORM
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr class="border-b border-black">
                                        <td class="p-4 border-r border-black w-1/6 sm:w-36 space-y-4 sm:space-y-0 sm:space-x-2">
                                          <a
                                            href={
                                              "tel:+234" +
                                              registrationData().user
                                                .phone_number
                                            }
                                            class="green-btn p-3 inline-block w-full sm:w-auto hover:opacity-60"
                                          >
                                            Call
                                          </a>
                                          <button
                                            onClick={() => setShowSendSMS(true)}
                                            class="green-btn p-3 w-full sm:w-auto hover:opacity-60"
                                          >
                                            SMS
                                          </button>
                                        </td>
                                        <td class="p-4">
                                          <Show
                                            when={
                                              JSON.parse(
                                                localStorage.getItem("jetsUser")
                                              ).surname === "ict" ||
                                              JSON.parse(
                                                localStorage.getItem("jetsUser")
                                              ).surname === "dean"
                                            }
                                          >
                                            <DeanConfirmationForm
                                              customId={params.customId}
                                              periodId={params.periodId}
                                              phone={
                                                registrationData().user
                                                  .phone_number
                                              }
                                              whichForm="add_drop"
                                            />
                                          </Show>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td colSpan={2}>
                                          *Call works only when using a mobile
                                          device.
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </Show>
                            </div>
                          }
                        >
                          <Loading />
                        </Show>
                      </div>
                    </div>
                  </>
                }
              >
                <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
                  <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
                    <h2 class="text-center text-blue-900 font-semibold">
                      Incomplete Registration
                    </h2>

                    <div class="my-2 border-t border-b py-4 border-black space-y-4">
                      <Failure />
                      <p>
                        You cannot perform Add/Drop for the chosen semester
                        because you have not finished the semeter's
                        registration.
                      </p>
                    </div>
                  </div>
                </div>
              </Show>
            </>
          }
        >
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Add/Drop Complete
              </h2>
              <div class="my-2 border-t border-b py-4 border-black space-y-4">
                <img
                  src="/happy.gif"
                  class="w-40 mx-auto p-3 border-4 border-green-600 rounded-full"
                />
                <p>
                  Congratulations! Your add/drop for the chosen semester is
                  COMPLETE! Click the link below to download and print your
                  completed add/drop form:
                </p>
                <p class="text-center">
                  <A
                    href="/student/print-outs"
                    class="hover:opacity-60 p-3 green-btn"
                  >
                    Go to Print
                  </A>
                </p>
                <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
                  <p>
                    <b>NOTE:</b>
                    <br />
                    Always print a copy of your completed add/drop form and KEEP
                    it. You will need them during your graduation clearance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </MetaProvider>
  );
}
