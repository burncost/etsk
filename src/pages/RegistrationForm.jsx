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
import ChangeChargeForm from "../components/ChangeChargeForm";

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

  const [regStatus, setRegStatus] = createSignal("");
  const [undertakingStatus, setUndertakingStatus] = createSignal("");
  const [regComment, setRegComment] = createSignal("");
  const [showNotification, setShowNotification] = createSignal(false);
  const [pickedCourses, setPickedCourses] = createStore([]);
  const [detPickedCourses, setDetPickedCourses] = createStore([]);
  const [totalCU, setTotalCU] = createSignal(0);
  const [totalProgFee, setTotalProgFee] = createSignal(0);

  const [showSendSMS, setShowSendSMS] = createSignal(false);

  const [finished, setFinished] = createSignal(false);

  const [modeOfStudy, setModeOfStudy] = createSignal("");
  const [denomination, setDenomination] = createSignal("");

  const [prg, setPgr] = createSignal("");
  // double tuition
  const [sid, setSid] = createSignal("");
  const listofdoubles = ["64407", "63911", "64082", "04328"];
  const coursestoDouble = ["CEDU 723", "CEDU 724", "CEDU 721", "PAS 4714"];

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

      // double tuition
      setSid(result.response.username);
      // console.log(sid())

      if (result.response === "Expired token") {
        localStorage.removeItem("jetsUser");
        navigate("/", { replace: true });
      } else {
        var registration = await fetchRegistration();

        if (registration.registration_status === "completed") {
          setFinished(true);
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
              setRegStatus(registration.registration_status);
              setUndertakingStatus(registration.undertaking);
              setRegComment(registration.comment);
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
                getCourseDetails(JSON.parse(registration.picked_courses));
                setPickedCourses(JSON.parse(registration.picked_courses));
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
        regStatus,
        undertakingStatus,
        regComment,
      };
    } else {
      navigate("/", { replace: true });
    }
  };
  
  const aff_fees = 40000;
  const c = {};
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
        // console.log(`Amount3: ${result}`);
        if (result.response) {
          if (
            student.programme_category === "Bachelor of Arts Programme" ||
            student.programme_category === "Diploma Programme"
          ) {
            var prog_cat = "UG";
          } else {
            var prog_cat = "PG";
          }
          
          // console.log(`Denomination: ${prog_cat}`)
          const res2 = await fetch(
            VITE_API_URL + "/api/course-fee/" +
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
          // console.log(`Amount: ${result2.response.amount}`);

          if (result.response.hours === "P/F") {
            var course_amount = 7500;
            var course_hrs = 0;
            var display_course_hrs = "P/F";

            var sub_amount = parseInt(course_amount) * 1;
          }
          // double course fees here
          else if(listofdoubles.includes(sid()) && coursestoDouble.includes(result.response.code)) {
            if (result.response.code === "PAS 4714"){
              var course_amount = 8000;
              var course_hrs = 1;
              var display_course_hrs = 1;
              var sub_amount = parseInt(course_amount) * 1;
            }else{
              var course_amount = 8000;
              var course_hrs = 3;
              var display_course_hrs = 3;
              var sub_amount = parseInt(course_amount) * 3;
            }
          }
          // end double here
           else {
            var course_amount = result2.response.amount;
            console.log(`Amount: ${course_amount}`)
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
    setIsProcessing(true);

    try{
      const isOnline = modeOfStudy() === "Virtual";
      const url = `${VITE_API_URL}/api/view-courses-by-year/${year}?online=${isOnline}`;
      const response = await fetch(url, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("jetsUser")).token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      const data = await response.json();
      setCourses(data.response);
      setShowCourses(true);
    }catch (error){
      console.error("Fetch error: ", error);
    }
    finally{
      setIsProcessing(false);
    }
  };

  const pickThisCourse = async (courseCode) => {
    var new_courses = [];

    if (pickedCourses) {
      var coursesArray = Object.keys(pickedCourses).map(
        (key) => pickedCourses[key]
      );
      for (let index = 0; index < coursesArray.length; index++) {
        var picked = checkIfPicked(courseCode);

        if (picked) {
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
      picked_courses: JSON.stringify(new_courses),
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
      if (registration.picked_courses) {
        setPickedCourses(JSON.parse(registration.picked_courses));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const unpickThisCourse = async (courseCode, courseCu, courseAmt) => {
    var pickedCoursesArray = Object.keys(pickedCourses).map(
      (key) => pickedCourses[key]
    );
    const index = pickedCoursesArray.indexOf(courseCode);
    const x = pickedCoursesArray.splice(index, 1);

    var courseData = {
      period_id: params.periodId,
      picked_courses: JSON.stringify(pickedCoursesArray),
    };

    var new_cu = parseInt(totalCU()) - parseInt(courseCu);
    var new_amt =
      parseInt(totalProgFee()) - parseInt(courseAmt) * parseInt(courseCu);

    setTotalCU(new_cu);

    if (student.special_student_category === "jets staff") {
      setTotalProgFee(parseInt(total_amt) / 2);
    } else {
      setTotalProgFee(total_amt);
    }

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

      var registration = await fetchRegistration();

      setTotalCU(parseInt(totalCU()) - parseInt(courseCu));

      setPickedCourses(JSON.parse(registration.pickedCourses));

      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 600);
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
            registration_status: "awaiting dean",
          }),
        }
      );

      const result = await response.json();
      window.location.href =
        "/student/registration-form/" + params.periodId + "/" + params.customId;
    } catch (error) {
      console.error(error);
    }
  };

  const completeRegistration = async (l) => {
    setIsProcessing(true);

    const walletBal = Number(portalWallet()) || 0;
    const adminTotal = Number(registrationData().adminCharges?.["total"]?.[0]) || 0;
    const progFee = Number(totalProgFee()) || 0;
    const hasAffiliation = registrationData().student?.affiliation_status === "yes" && period?.semester === "1st";
    const affFee = hasAffiliation ? 40000 : 0;
    
    const totalDue = adminTotal + progFee + affFee;
    const new_bal = walletBal - totalDue;
    
    var now = new Date();
    var year = now.getFullYear().toString().substring(2, 4);

    // var now = new Date();
    // var year = now.getFullYear();
    // var year = year.toString();
    // var year = year.substring(2, 4);
    var sem_rep = "X";
    if (registrationData().period.semester === "1st") sem_rep = "A";
    else if (registrationData().period.semester === "2nd") sem_rep = "B";
    else if (registrationData().period.semester === "Summer") sem_rep = "S";
    else if (registrationData().period.semester === "Pre-Summer") sem_rep = "PS";
    
    var formNumber = "R" + sem_rep + params.customId + year;
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
            registration_status: "completed",
            registration_opening_balance: portalWallet(),
            registration_closing_balance: new_bal,
            registration_form_number: formNumber,
          }),
        }
      ).then((response) => response.json());

      Promise.all([request1, request2]).then(([data1, data2]) => {
        setFinished(true);
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

  const [editChargePopup, setEditChargePopup] = createSignal(false);
  const [editChargeVal, setEditChargeVal] = createSignal();
  const editSingleCharge = (val) => {
    setEditChargePopup(true);
    setEditChargeVal(val);
  };

  const params = useParams();

  const [registrationData] = createResource(registrationFormData);

  return (
    <MetaProvider>
      <Title>Registration Form - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Registration Form on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={editChargePopup()}>
          <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Change <u>{editChargeVal()}</u> Charge
              </h2>
              <div class="my-2 border-t border-b py-4 border-black">
                <ChangeChargeForm
                  val={editChargeVal()}
                  charges={registrationData().adminCharges}
                />
              </div>
            </div>
          </div>
        </Show>
        <Show when={showNotification()}>
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <p class="bg-green-300 text-green-800 drop-shadow-xl p-4 rounded w-80 mx-auto text-center">
              Action was Successful!
            </p>
          </div>
        </Show>
        <Show
          when={finished()}
          fallback={
            <>
              <Show when={showSendSMS()}>
                <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
                  <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
                    <h2 class="text-center text-blue-900 font-semibold">
                      Send SMS to Student
                    </h2>

                    <div class="my-2 border-t border-b py-4 border-black">
                      <SendSMSForm
                        phone={registrationData().user.phone_number}
                      />
                    </div>
                    <div class="text-right space-x-3">
                      <button
                        onClick={() => setShowSendSMS(false)}
                        class="gray2-btn text-white p-3 hover:opacity-60"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </Show>
              <Show when={showCourses()}>
                <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
                  <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-3 h-5/6 overflow-hidden">
                    <h2 class="text-center text-blue-900 font-semibold">
                      Pick {coursesLevel()} Course(s)
                    </h2>
                    {/* <Show when={showNotification()}>
                      <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
                        <p class="bg-green-300 text-green-800 drop-shadow-xl p-4 rounded w-80 mx-auto text-center">
                          Action was Successful!
                        </p>
                      </div>
                    </Show> */}
                    <div class="my-2 border-t border-b border-black py-4 h-5/6 overflow-y-scroll">
                      <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
                        <b class="block">Instruction:</b>
                        <p>You may scroll down to see more courses.</p>
                        <p class="border-t border-blue-900">
                          Click the red button labelled "+" corresponding to the
                          course(s) you wish to pick.
                        </p>
                        <p class="border-t border-blue-900">
                          When a button labelled "+" corresponding to a course
                          is gray it means you have already picked the course.
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
                            <td class="p-1 border-r border-black">Code</td>
                            <td class="p-1 border-r border-black">Title</td>
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
                                      <td class="p-3 text-center" colSpan={5}>
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
                                              when={checkIfPicked(course.code)}
                                            >
                                              <button
                                                disabled
                                                class="gray2-btn py-1 px-2 text-white cursor-not-allowed"
                                              >
                                                +
                                              </button>
                                            </Match>
                                            <Match
                                              when={!checkIfPicked(course.code)}
                                            >
                                              <button
                                                onClick={() => {
                                                  pickThisCourse(course.code);
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
                            "/student/registration-form/" +
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
                  Student Registration Form
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
                        when={registrationData().regStatus() === "started"}
                      >
                        <b class="block">
                          Registration Status:{" "}
                          <u class="text-red-700 font-semibold uppercase">
                            Started
                          </u>
                        </b>
                        <b class="text-blue-900">Note:</b>
                        <br />
                        You have started your registration. Please ensure to
                        pick your appropriate courses for the semester.
                        <br />
                        When satisfied with your picked courses, forward to
                        DPAA's office for approval.
                      </Match>
                      <Match
                        when={
                          registrationData().regStatus() === "awaiting dean"
                        }
                      >
                        <b class="block">
                          Registration Status:{" "}
                          <u class="text-red-700 font-semibold uppercase">
                            Awaiting DPAA's Office
                          </u>
                        </b>
                        <b class="text-blue-900">Note:</b>
                        <br />
                        Your registration is at the Dean's Office and awaiting
                        approval. This should normally take 24 hours or less.
                        <br />
                        When approved or disapproved, you'll be notified via
                        SMS. However, if you don't get notified after 24 hours
                        please check/reload this page again.
                      </Match>
                      <Match
                        when={registrationData().regStatus() === "disapproved"}
                      >
                        <b class="block">
                          Registration Status:{" "}
                          <u class="text-red-700 font-semibold uppercase">
                            Disapproved
                          </u>
                        </b>
                        <b class="text-blue-900">Note:</b>
                        <br />
                        Your registration was Disapproved.
                        <br />
                        <b class="text-blue-900">Reason(s):</b>
                        <br />
                        <p class="bg-black border-l-8 border-red-600 text-white rounded p-2">
                          {registrationData().regComment()}
                        </p>
                      </Match>
                      <Match
                        when={
                          registrationData().regStatus() === "awaiting bursar"
                        }
                      >
                        <b class="block">
                          Registration Status:{" "}
                          <u class="text-red-700 font-semibold uppercase">
                            Awaiting Bursary
                          </u>
                        </b>
                        <b class="text-blue-900">Note:</b>
                        <br />
                        Your registration was approved by DPAA's office and
                        forwarded to the Bursary.
                        <br />
                        The Bursary will input your current ledger balance (this
                        should take 24 hours or less) after which you'll be
                        notified via SMS. However, if you don't get notified
                        after 24 hours please check/reload this page again.
                      </Match>
                      <Match
                        when={registrationData().regStatus() === "incomplete"}
                      >
                        <b class="block">
                          Registration Status:{" "}
                          <u class="text-red-700 font-semibold uppercase">
                            Incomplete Registration
                          </u>
                        </b>
                        <b class="text-blue-900">Note:</b>
                        <br />
                        Your registration has been approved BUT it is INCOMPLETE
                        because you are yet to submit and print this
                        registration form. Scroll to the bottom of this page to
                        do that now.
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
                          <table cellPadding={0} cellSpacing={0} class="w-full">
                            <thead>
                              <tr class="bg-white border-b border-black text-blue-900">
                                <th class="p-1 text-left uppercase" colSpan={5}>
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
                                    {registrationData().period.semester} (
                                    {registrationData().period.season})
                                  </span>
                                </td>
                                <td class="p-4" rowSpan={4}>
                                  <div class="w-40 max-h-40 overflow-hidden rounded-md">
                                    <img
                                      src={getOptPassport(
                                        registrationData().user.passport_url
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
                                  {registrationData().student.ledger_number}
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
                                    {registrationData().student.denomination}
                                  </span>
                                </td>
                              </tr>
                              <tr class="border-b border-black">
                                <td class="p-4" >
                                  <b>Programme:</b>&nbsp;
                                  {registrationData().student.programme}
                                </td>
                                <td class="p-4">
                                  <b>Mode of Study:</b>&nbsp;
                                  <span class="uppercase">
                                    {modeOfStudy()}
                                  </span>
                                </td>
                                <td class="p-4">
                                  <b>Affiliation Status.:</b>&nbsp;
                                  <span class="uppercase">
                                    {registrationData().student.affiliation_status}
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
                          <table cellPadding={0} cellSpacing={0} class="w-full">
                            <thead>
                              <tr class="bg-white border-b border-black text-blue-900">
                                <th class="p-1 text-left uppercase" colSpan={3}>
                                  :: Seminary Charges
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr class="bg-gray-400 border-b border-black font-semibold">
                                <td class="p-4 border-r border-black">Sn.</td>
                                <td class="p-4 border-r border-black">Item</td>
                                <td class="p-4">Amount</td>
                              </tr>
                              
                              <Show when={(modeOfStudy() !== "Virtual")}>
                                <For each={[
                                  "SUG Charges",
                                  "Health Insurance",
                                  "Departmental Charges",
                                  "Examination/Stationery",
                                  "Administrative Services",
                                  "Campus Development Levy",
                                  "ECWA Education Dept Levy",
                                  "Library Use and Services",
                                  "New Student Matriculation",
                                  "ICT Dev and Internet Access",
                                  "Seminary Student/Library ID Card",
                                  "Academic Catalogue",
                                  "Late Registration",
                                  "ACTEA Accreditation/Services"
                                ]}>
                                {(chargeName, i) => (
                                  <tr class="border-b border-black">
                                    <td class="p-4 border-r border-black font-semibold">
                                      {i() + 1}.
                                    </td>
                                    <td class="p-4 border-r border-black">
                                      {chargeName}
                                    </td>
                                    <td class="p-4">
                                      <Show when={registrationData().adminCharges[chargeName]}>
                                        {formatter.format(registrationData().adminCharges[chargeName][0])}
                                        <Show
                                          when={
                                            JSON.parse(localStorage.getItem("jetsUser")).surname === "ict" ||
                                            JSON.parse(localStorage.getItem("jetsUser")).surname === "bursar"
                                          }
                                        >
                                          &nbsp;[
                                          <span
                                            onClick={() => editSingleCharge(chargeName)}
                                            class="text-red-600 font-bold hover:opacity-60 cursor-pointer"
                                          >
                                            Edit
                                          </span>
                                          ]
                                        </Show>
                                      </Show>
                                    </td>
                                  </tr>
                                )}
                                </For>
                              
                                {/* Sub Total Row */}
                                <tr class="border-b border-black">
                                  <td class="p-4 border-r border-black font-semibold" colSpan={2}>
                                    Sub Total
                                  </td>
                                  <td class="p-4 font-semibold">
                                    <Show when={registrationData().adminCharges["total"]}>
                                      {pickedCourses.length < 2
                                        ? formatter.format(parseInt(registrationData().adminCharges["total"][0]) - parseInt(0))
                                        : formatter.format(parseInt(registrationData().adminCharges["total"][0]))}
                                    </Show>
                                  </td>
                                </tr>
                              </Show>
                            </tbody>

                            <tbody>
                                <tr>
                                  <td colSpan={3} class="h-6"></td>
                                </tr>
                              </tbody>

                            <thead>
                              <Show when={registrationData().student.affiliation_status === "yes" && period.semester==="1st"}>
                                <tr class="bg-white border-b border-black text-blue-900">                                  
                                  <th
                                    class="p-1 text-left uppercase"
                                    colSpan={3}
                                  >
                                    :: AFFILIATION FEE
                                  </th>                                  
                                </tr>
                                <tr class="border-b border-black">
                                  <td
                                    class="p-4 border-r border-black font-semibold"
                                    colSpan={2}
                                  >
                                    Sub Total
                                  </td>
                                  <td class="p-4 font-semibold">
                                      {formatter.format("40000"
                                          )}
                                  </td>
                                  <td class="p-4"></td>
                                </tr>
                                </Show>                              
                              </thead>                             
                          </table>
                        </div>
                        
                        <Show
                          when={
                            JSON.parse(localStorage.getItem("jetsUser"))
                              .role === "student" &&
                            (registrationData().regStatus() === "started" ||
                              registrationData().regStatus() === "disapproved")
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
                                  <th
                                    class="p-1 text-left uppercase"
                                    colSpan={3}
                                  >
                                    :: Pick COURSE(S)
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
                                          .current_level === "1-Diploma" ||
                                        registrationData().studentReg
                                          .current_level === "2-BA" ||
                                        registrationData().studentReg
                                          .current_level === "2-Diploma" ||
                                        registrationData().studentReg
                                          .current_level === "3-BA" ||
                                        registrationData().studentReg
                                          .current_level === "3-Diploma" ||
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
                                        onClick={() => showCoursesTable(1)}
                                      >
                                        Year 1 Course(s)
                                      </button>
                                    </Show>
                                    <Show
                                      when={
                                        registrationData().studentReg
                                          .current_level === "2-BA" ||
                                        registrationData().studentReg
                                          .current_level === "2-Diploma" ||
                                        registrationData().studentReg
                                          .current_level === "3-BA" ||
                                        registrationData().studentReg
                                          .current_level === "3-Diploma" ||
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
                                        onClick={() => showCoursesTable(2)}
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
                                          .current_level === "3-Diploma" ||
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
                                        onClick={() => showCoursesTable(3)}
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
                                        onClick={() => showCoursesTable(4)}
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
                                        onClick={() => showCoursesTable(5)}
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
                                        onClick={() => showCoursesTable(6)}
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
                                        onClick={() => showCoursesTable(7)}
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
                        <div class="overflow-x-auto">
                          <table cellPadding={0} cellSpacing={0} class="w-full">
                            <thead>
                              <tr class="bg-white border-b border-black text-blue-900">
                                <th class="p-1 text-left uppercase" colSpan={7}>
                                  :: PROGRAMME (
                                  {registrationData().student.programme})
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
                                    <tr class="border-b border-black">
                                      <td class="p-4 border-r border-black font-semibold">
                                        {i() + 1}.
                                      </td>
                                      <td class="p-4 border-r border-black">
                                        <Show
                                          when={detPickedCourses[course]}
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
                                          when={detPickedCourses[course]}
                                          fallback={<>Fetching.. .</>}
                                        >
                                          {detPickedCourses[course][1]}
                                        </Show>
                                      </td>
                                      <td class="p-4 border-r border-black">
                                        <Show
                                          when={detPickedCourses[course]}
                                          fallback={<>Fetching.. .</>}
                                        >
                                          {formatter.format(
                                            detPickedCourses[course][2]
                                          )}
                                        </Show>
                                      </td>
                                      <td class="p-4 border-r border-black">
                                        <Show
                                          when={detPickedCourses[course]}
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
                                              localStorage.getItem("jetsUser")
                                            ).role === "student" &&
                                            (registrationData().regStatus() ===
                                              "disapproved" ||
                                              registrationData().regStatus() ===
                                                "started")
                                          }
                                        >
                                          <button
                                            onClick={() => {
                                              unpickThisCourse(
                                                course,
                                                detPickedCourses[course][1],
                                                detPickedCourses[course][2]
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
                                    {formatter.format(parseInt(totalProgFee()))}
                                  </td>
                                </tr>
                              </Show>
                            </tbody>
                          </table>
                        </div>
                        <Show
                          when={
                            (totalCU() > 0 || pickedCourses.length > 0) &&
                            (registrationData().regStatus() === "started" ||
                              registrationData().regStatus() === "disapproved")
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
                                  <th
                                    class="p-1 text-left uppercase"
                                    colSpan={3}
                                  >
                                    :: FOR APPROVAL
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td class="p-3 text-sm">
                                    <span class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5 block">
                                      <b>
                                        Have you picked all your appropriate
                                        courses for the semester?
                                      </b>
                                      <br />
                                      <Show
                                        when={
                                          registrationData().regStatus() ===
                                          "disapproved"
                                        }
                                      >
                                        <b>
                                          Have you effected the needed
                                          correction(s)?
                                        </b>
                                      </Show>
                                      <br />
                                      If YES please click on the red colored
                                      button labelled 'Forward for Approval'
                                      below to forward your registration for
                                      approval.
                                      <br />
                                      <br />
                                      <b class="text-blue-900">Note:</b>
                                      <br />
                                      <b>DO NOT</b> click on this button if you
                                      are unsatisfied with or unsure of the
                                      courses you have picked.{" "}
                                      <b>
                                        If you need help please contact the
                                        relevant office.
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
                                              registrationData().regStatus() ===
                                              "disapproved"
                                            }
                                            fallback={<>Forward for Approval</>}
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
                          when={registrationData().regStatus() === "incomplete"}
                        >
                          <div class="overflow-x-auto">
                            <table
                              cellPadding={0}
                              cellSpacing={0}
                              class="w-full"
                            >
                              <thead>
                                <tr class="bg-white border-b border-black text-blue-900">
                                  <th class="p-1 text-left uppercase">
                                    :: SUMMARY OF FEES
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr class="border-b border-black">
                                  <td class="p-4">
                                    <span class="flex justify-evenly">
                                      <span>
                                        Portal Wallet Before Registration:{" "}
                                        <b>
                                          {formatter.format(
                                            parseInt(portalWallet())
                                          )}
                                        </b>
                                      </span>
                                      <span>
                                        Seminary Charges:{" "}
                                        <b>
                                          {pickedCourses.length < 2
                                            ? formatter.format(
                                                parseInt(
                                                  registrationData()
                                                    .adminCharges["total"][0]
                                                ) - parseInt(0)
                                              )
                                            : formatter.format(
                                                parseInt(
                                                  registrationData()
                                                    .adminCharges["total"][0]
                                                )
                                              )}
                                        </b>
                                      </span>
                                      <span>
                                        Program Fees:{" "}
                                        <b>
                                          {formatter.format(
                                            parseInt(totalProgFee())
                                          )}
                                        </b>
                                      </span>
                                      <span>
                                        <Show when={registrationData().student.affiliation_status === "yes" && period.semester==="1st"}>
                                        Affiliaton Fee:{" "}
                                        <b>
                                          {formatter.format(
                                            parseInt(aff_fees)
                                          )}
                                        </b>
                                        </Show>
                                      </span>
                                      </span>
                                      </td>
                                    </tr>  
                                    <tr class="border-b border-black">
                                  <td class="p-4">
                                    <span class="flex justify-evenly">
                                      <span class="">
                                        Total Charges:{" "}
                                        <b>
                                          <Show
                                            when={pickedCourses.length < 2}
                                            fallback={formatter.format(
                                              parseInt(
                                                registrationData().adminCharges[
                                                  "total"
                                                ][0]
                                              ) + parseInt(totalProgFee()) +
                                              (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                            )}
                                          >
                                            {formatter.format(
                                              parseInt(
                                                registrationData().adminCharges[
                                                  "total"
                                                ][0]
                                              ) -
                                                parseInt(0) +
                                                parseInt(totalProgFee()) +
                                                (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                            )}
                                          </Show>
                                        </b>
                                      </span>
                                      <span>
                                        Amount to Add: <b>
                                          <Show when={pickedCourses.length < 2} fallback={
                                            <Show when={
                                              parseInt(portalWallet()) >=
                                              parseInt(registrationData().adminCharges["total"][0]) +
                                                parseInt(totalProgFee()) +
                                                (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                            } fallback={
                                              <b>
                                                {formatter.format(
                                                  parseInt(registrationData().adminCharges["total"][0]) +
                                                    parseInt(totalProgFee()) +
                                                    (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0) -
                                                    parseInt(portalWallet())
                                                )}
                                              </b>
                                            }>
                                              <b>{formatter.format(0)}</b>
                                            </Show>
                                          }>
                                            <Show when={
                                              parseInt(portalWallet()) >=
                                              parseInt(registrationData().adminCharges["total"][0]) -
                                                parseInt(0) +
                                                parseInt(totalProgFee()) +
                                                (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                            } fallback={
                                              <b>
                                                {formatter.format(
                                                  parseInt(registrationData().adminCharges["total"][0]) -
                                                    parseInt(0) +
                                                    parseInt(totalProgFee()) +
                                                    (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0) -
                                                    parseInt(portalWallet())
                                                )}
                                              </b>
                                            }>
                                              <b>{formatter.format(0)}</b>
                                            </Show>
                                          </Show>
                                        </b>
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
                                    <th class="p-1 text-left uppercase">
                                      :: SUBMIT & PRINT
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr class="border-black">
                                    {(() => {
                                      // Safe number parsing to prevent NaN bugs
                                      const walletBal = Number(portalWallet()) || 0;
                                      const adminTotal = Number(registrationData()?.adminCharges?.["total"]?.[0]) || 0;
                                      const progFee = Number(totalProgFee()) || 0;
                                      const hasAffiliation = registrationData()?.student?.affiliation_status === "yes" && period?.semester === "1st";
                                      const affFee = hasAffiliation ? 40000 : 0;
                                      
                                      const totalRequired = adminTotal + progFee + affFee;
                                      const isUndertakingApproved = registrationData()?.undertakingStatus() === "yes";
                                      const canSubmit = isUndertakingApproved || walletBal >= totalRequired;
                                      const amountNeeded = Math.max(0, totalRequired - walletBal);

                                      return (
                                        <>
                                          <Show when={canSubmit}>
                                            <button
                                              onClick={() => completeRegistration(pickedCourses.length)}
                                              class="green-btn p-3 text-center hover:opacity-60"
                                            >
                                              Submit & Print My Registration
                                            </button>
                                          </Show>
                                          <Show when={!canSubmit}>
                                            <div class="bg-yellow-100 rounded-md border border-yellow-200 p-2 mt-2">
                                              <b>Insufficient Funds!</b> You need <b>{formatter.format(amountNeeded)}</b> more to complete registration.
                                            </div>
                                            <button
                                              disabled
                                              class="gray2-btn p-3 text-center cursor-not-allowed"
                                            >
                                              Submit & Print (Insufficient Funds)
                                            </button>
                                          </Show>
                                        </>
                                      );
                                    })()}
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
                                  <th
                                    class="p-1 text-left uppercase"
                                    colSpan={6}
                                  >
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
                                        registrationData().user.phone_number
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
                                          registrationData().user.phone_number
                                        }
                                        whichForm="registration"
                                      />
                                    </Show>
                                    <Show
                                      when={
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).surname === "ict" ||
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).surname === "bursar"
                                      }
                                    >
                                      <BursarConfirmationForm
                                        customId={params.customId}
                                        periodId={params.periodId}
                                        phone={
                                          registrationData().user.phone_number
                                        }
                                        currentBal={portalWallet()}
                                      />
                                    </Show>
                                  </td>
                                </tr>
                                <tr>
                                  <td colSpan={2}>
                                    *Call works only when using a mobile device.
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
          <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Registration Complete
              </h2>

              <div class="my-2 border-t border-b py-4 border-black space-y-4">
                <img
                  src="/happy.gif"
                  class="w-40 mx-auto p-3 border-4 border-green-600 rounded-full"
                />

                <p>
                  Congratulations! Your registration for the chosen semester is
                  COMPLETE! Click the link below to download and print your
                  completed registration form:
                </p>
                <p class="text-center py-6">
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
                    Always print a copy of your completed registration form and
                    KEEP it. You will need them during your graduation
                    clearance.
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
