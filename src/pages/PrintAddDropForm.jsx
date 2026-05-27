import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";
import { Match, Show, Switch, createResource, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import Loading from "../components/Loading";

export default function RegistrationForm() {
  const [user, setUser] = createStore();
  const [student, setStudent] = createStore();
  const [studentReg, setStudentReg] = createStore();
  const [adminCharges, setAdminCharges] = createStore();
  const [period, setPeriod] = createStore();
  const [openingBalance, setOpeningBalance] = createSignal("");
  const [closingBalance, setClosingBalance] = createSignal("");

  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env["VITE_API_URL"];
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [courses, setCourses] = createStore([]);
  const [coursesLevel, setCoursesLevel] = createSignal("");
  const [courseDepartment, setCourseDepartment] = createSignal("");
  const [courseSemester, setCourseSemester] = createSignal("");
  const [showCourses, setShowCourses] = createSignal(false);
  const [courseCategory, setCourseCategory] = createSignal("");

  const [regStatus, setRegStatus] = createSignal("");
  const [regComment, setRegComment] = createSignal("");
  const [showNotification, setShowNotification] = createSignal(false);
  const [pickedCourses, setPickedCourses] = createStore([]);
  const [detPickedCourses, setDetPickedCourses] = createStore([]);
  const [addedCourses, setAddedCourses] = createStore([]);
  const [detAddedCourses, setDetAddedCourses] = createStore([]);
  const [droppedCourses, setDroppedCourses] = createStore([]);
  const [detDroppedCourses, setDetDroppedCourses] = createStore([]);
  const [totalCU, setTotalCU] = createSignal(0);
  const [totalProgFee, setTotalProgFee] = createSignal(0);
  const [droppedTotalCU, setDroppedTotalCU] = createSignal(0);
  const [droppedTotalProgFee, setDroppedTotalProgFee] = createSignal(0);
  const [addedTotalCU, setAddedTotalCU] = createSignal(0);
  const [addedTotalProgFee, setAddedTotalProgFee] = createSignal(0);

  const [dropCourseCode, setDropCourseCode] = createSignal("");
  const [dropCourseCU, setDropCourseCU] = createSignal("");
  const [dropCourseAmt, setDropCourseAmt] = createSignal("");
  const [showDropConfirmation, setShowDropConfirmation] = createSignal(false);

  const [formNumber, setFormNumber] = createSignal("");

  const [modeOfStudy, setModeOfStudy] = createSignal("");
  const [denomination, setDenomination] = createSignal("");
  const [prg, setPgr] = createSignal("");

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

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

        if (registration.add_drop_status === "completed") {
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

          Promise.all([request0, request1, request2])
            .then(([data0, data1, data2]) => {
              setStudent(data1.response);
              setStudentReg(registration);
              setRegStatus(registration.add_drop_status);
              setClosingBalance(registration.add_drop_closing_balance);
              setOpeningBalance(registration.add_drop_opening_balance);
              setRegComment(registration.comment);
              setFormNumber(registration.add_drop_form_number);
              setPeriod(data2.response);
              setUser(data0.response);

              // console.log(user["mode_of_study"])
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
                getCourseDetails(
                  JSON.parse(registration.picked_courses),
                  "picked"
                );
                setPickedCourses(JSON.parse(registration.picked_courses));
              }
              if (registration.added_courses) {
                getCourseDetails(
                  JSON.parse(registration.added_courses),
                  "added"
                );
                setAddedCourses(JSON.parse(registration.added_courses));
              }
              if (registration.dropped_courses) {
                // getCourseDetails(
                //   JSON.parse(registration.picked_courses),
                //   "dropped"
                // );
                getDroppedCourseDetails(
                  JSON.parse(registration.dropped_courses)
                );
                setDroppedCourses(JSON.parse(registration.dropped_courses));
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          navigate("/");
        }
      }
      return {
        student,
        adminCharges,
        period,
        studentReg,
        user,
        addedCourses,
        droppedCourses,
        regStatus,
        regComment,
      };
    } else {
      navigate("/", { replace: true });
    }
  };

  const c = {};
  var picked_total_cu = 0;
  var picked_total_amt = 0;
  var added_total_cu = 0;
  var added_total_amt = 0;
  var dropped_total_cu = 0;
  var dropped_total_amt = 0;
  const getCourseDetails = async (arr, which) => {
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
            var course_hrs = 1;
          } else {
            var course_amount = result2.response.amount;
            var course_hrs = result.response.hours;
          }

          var sub_amount = parseInt(course_amount) * parseInt(course_hrs);

          c[arr[i]] = [
            result.response.title,
            course_hrs,
            course_amount,
            sub_amount,
          ]; //create object
          if (which === "picked") {
            picked_total_cu = picked_total_cu + parseInt(course_hrs);
            picked_total_amt = picked_total_amt + parseInt(sub_amount);
          }
          if (which === "dropped") {
            dropped_total_cu = dropped_total_cu + parseInt(course_hrs);
            dropped_total_amt = dropped_total_amt + parseInt(sub_amount);
          }
          if (which === "added") {
            added_total_cu = added_total_cu + parseInt(course_hrs);
            added_total_amt = added_total_amt + parseInt(sub_amount);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (which === "picked") {
      setDetPickedCourses(c);
      setTotalCU(picked_total_cu);
      setTotalProgFee(picked_total_amt);
    }

    if (which === "dropped") {
      // console.log(dropped_total_cu);
      setDetDroppedCourses(c);
      setDroppedTotalCU(dropped_total_cu);
      setDroppedTotalProgFee(dropped_total_amt);
    }

    if (which === "added") {
      setDetAddedCourses(c);
      setAddedTotalCU(added_total_cu);
      setAddedTotalProgFee(added_total_amt);
    }
  };

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

          // console.log(result2);

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

  const printNow = async () => {
    if (JSON.parse(localStorage.getItem("jetsUser")).surname === "bursar") {
      var theData = {
        period_id: params.periodId,
        add_drop_print_bursar: "yes",
      };
    }
    if (JSON.parse(localStorage.getItem("jetsUser")).surname === "dean") {
      var theData = {
        period_id: params.periodId,
        add_drop_print_dean: "yes",
      };
    }
    if (JSON.parse(localStorage.getItem("jetsUser")).surname === "registrar") {
      var theData = {
        period_id: params.periodId,
        add_drop_print_registrar: "yes",
      };
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
          body: JSON.stringify(theData),
        }
      );
      const result = await response.json();

      window.print();
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
      <Title>Print Add/Drop Form - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Print Add/Drop Form on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <>
        {/* Print Action Bar - Hidden on Print */}
        <div
          onClick={() => printNow()}
          class="no-print bg-gradient-to-r from-purple-900 to-purple-700 text-white text-lg text-center py-4 cursor-pointer hover:opacity-90 transition-opacity shadow-md"
        >
          🖨️ Click Here to Print Add/Drop Form
        </div>

        {/* Main Form Container - Academic Style */}
        <div class="bg-white text-gray-800 font-serif max-w-5xl mx-auto my-6 shadow-lg print:shadow-none print:m-0 text-sm">
          
          {/* Institutional Header */}
          <header class="border-b-4 border-purple-900 bg-gradient-to-r from-purple-50 to-amber-50 px-8 py-6">
            <div class="flex items-center justify-between">
              {/* Logo Section */}
              <div class="w-20">
                <img src="/small-logo.png" class="w-full h-auto" alt="ETSK Logo" />
              </div>
              
              {/* Institution Title */}
              <div class="text-center flex-1 px-4">
                <h1 class="text-2xl font-bold text-purple-900 uppercase tracking-wide">
                  ECWA Theological Seminary, KAGORO (ETSK)
                </h1>
                <p class="text-lg text-gray-700 mt-1">
                  <Show
                    when={
                      registrationData().studentReg.current_level === "5" ||
                      registrationData().studentReg.current_level === "6" ||
                      registrationData().studentReg.current_level === "7"
                    }
                    fallback={<span class="text-purple-700 font-medium">Undergraduate</span>}
                  >
                    <span class="text-amber-700 font-medium">Postgraduate</span>
                  </Show>{" "}
                  <span class="text-gray-600">Student Online Add/Drop</span>
                </p>
              </div>
              
              {/* Form Number */}
              <div class="text-right">
                <div class="bg-purple-900 text-amber-100 px-4 py-2 rounded-lg shadow-sm">
                  <span class="text-xs uppercase tracking-wider">Form No.</span>
                  <Show fallback={<>AD{params.customId}</>} when={formNumber()}>
                    <div class="text-xl font-bold font-mono">{formNumber()}</div>
                  </Show>
                </div>
              </div>
            </div>
            
            {/* Session Info Bar */}
            <div class="mt-4 pt-4 border-t border-purple-200 flex flex-wrap gap-4 text-sm">
              <div><span class="font-semibold text-purple-800">Admission Year:</span> {registrationData().student.year_of_admission}</div>
              <div><span class="font-semibold text-purple-800">Date:</span> {new Date().getDate()}-{new Date().getMonth() + 1}-{new Date().getFullYear()}</div>
              <div><span class="font-semibold text-purple-800">Session:</span> {registrationData().period.session}</div>
              <div><span class="font-semibold text-purple-800">Semester:</span> <span class="uppercase">{registrationData().period.semester}</span></div>
            </div>
          </header>

          {/* Content Body */}
          <div class="px-8 py-6 space-y-8">
            
            {/* ===== PERSONAL DATA SECTION ===== */}
            <section class="border-2 border-purple-100 rounded-xl overflow-hidden">
              <div class="bg-purple-900 text-amber-100 px-5 py-3 flex items-center justify-between">
                <h2 class="font-bold text-lg tracking-wide">:: Personal Data</h2>
                {/* Passport Photo */}
                <div class="w-24 h-24 border-2 border-amber-300 rounded-lg overflow-hidden bg-white shadow-inner">
                  <img
                    src={getOptPassport(registrationData().user.passport_url)}
                    class="w-full h-full object-cover"
                    alt="Student Passport"
                  />
                </div>
              </div>
              
              <div class="p-5 bg-white">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Full Name</span>
                    <span class="font-semibold text-purple-900 uppercase">
                      {registrationData().user.surname}
                    </span>{" "}
                    <span>{registrationData().user.first_name} {registrationData().user.other_names}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Gender</span>
                    <span class="font-medium uppercase">{registrationData().user.gender}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Phone</span>
                    <span>{registrationData().user.phone_number}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Email</span>
                    <span class="break-all">{registrationData().student.email}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Ledger No.</span>
                    <span class="font-mono font-medium">{registrationData().student.ledger_number}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Matric No.</span>
                    <span class="font-mono font-medium uppercase">{registrationData().student.matriculation_number}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Special Category</span>
                    <span class="capitalize">{registrationData().student.special_student_category}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Denomination</span>
                    <span>{registrationData().student.denomination}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Programme</span>
                    <span class="font-medium">{registrationData().student.programme}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Mode of Study</span>
                    <span class="font-medium">{modeOfStudy()}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Affiliation</span>
                    <span class="uppercase font-medium">{registrationData().student.affiliation_status}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 block text-xs uppercase tracking-wide">Current Level</span>
                    <span>
                      {registrationData().studentReg.current_level}
                      <span class="text-gray-500 ml-1">
                        ({registrationData().studentReg.fresh_returning} Student)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ===== DROPPED COURSES SECTION ===== */}
            <section class="border-2 border-purple-100 rounded-xl overflow-hidden">
              <div class="bg-purple-900 text-amber-100 px-5 py-3">
                <h2 class="font-bold text-lg tracking-wide">:: Dropped Courses</h2>
              </div>
              
              <div class="p-5 bg-white overflow-x-auto">
                <Show
                  when={droppedCourses}
                  fallback={
                    <div class="text-center py-8 text-gray-500 italic">
                      No course(s) dropped.
                    </div>
                  }
                >
                  <table class="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr class="border-b-2 border-purple-200 bg-purple-50">
                        <th class="text-left py-2 px-3 w-10 text-gray-600 font-medium">Sn.</th>
                        <th class="text-left py-2 px-3 text-gray-600 font-medium">Course Title</th>
                        <th class="text-left py-2 px-3 text-gray-600 font-medium">Code</th>
                        <th class="text-center py-2 px-3 text-gray-600 font-medium w-16">CH</th>
                        <th class="text-right py-2 px-3 text-gray-600 font-medium">Unit Cost</th>
                        <th class="text-right py-2 px-3 text-gray-600 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-purple-50">
                      <For each={droppedCourses}>
                        {(course, i) => (
                          <tr class="hover:bg-purple-50 transition-colors">
                            <td class="py-2 px-3 font-medium text-purple-800">{i() + 1}.</td>
                            <td class="py-2 px-3">
                              <Show when={detDroppedCourses[course]} fallback={<span class="text-gray-400 italic">Loading...</span>}>
                                {detDroppedCourses[course][0]}
                              </Show>
                            </td>
                            <td class="py-2 px-3 font-mono font-medium text-purple-700">
                              <Show when={course} fallback={<span class="text-gray-400 italic">Loading...</span>}>
                                {course}
                              </Show>
                            </td>
                            <td class="py-2 px-3 text-center font-medium">
                              <Show when={detDroppedCourses[course]} fallback={<span class="text-gray-400">–</span>}>
                                {detDroppedCourses[course][1]}
                              </Show>
                            </td>
                            <td class="py-2 px-3 text-right font-mono">
                              <Show when={detDroppedCourses[course]} fallback={<span class="text-gray-400">–</span>}>
                                {formatter.format(detDroppedCourses[course][2])}
                              </Show>
                            </td>
                            <td class="py-2 px-3 text-right font-mono font-semibold text-purple-900">
                              <Show when={detDroppedCourses[course]} fallback={<span class="text-gray-400">–</span>}>
                                {formatter.format(detDroppedCourses[course][3])}
                              </Show>
                            </td>
                          </tr>
                        )}
                      </For>
                      
                      {/* Dropped Subtotal */}
                      <tr class="bg-gradient-to-r from-purple-50 to-amber-50 font-semibold border-t-2 border-purple-200">
                        <td class="py-3 px-3" colSpan={3}>Sub Total (Dropped)</td>
                        <td class="py-3 px-3 text-center font-medium">{droppedTotalCU()}</td>
                        <td class="py-3 px-3"></td>
                        <td class="py-3 px-3 text-right font-mono text-purple-900">
                          {formatter.format(parseInt(droppedTotalProgFee()))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Show>
              </div>
            </section>

            {/* ===== ADDED COURSES SECTION ===== */}
            <section class="border-2 border-purple-100 rounded-xl overflow-hidden">
              <div class="bg-purple-900 text-amber-100 px-5 py-3">
                <h2 class="font-bold text-lg tracking-wide">:: Added Courses</h2>
              </div>
              
              <div class="p-5 bg-white overflow-x-auto">
                <Show
                  when={addedCourses}
                  fallback={
                    <div class="text-center py-8 text-gray-500 italic">
                      No course(s) added.
                    </div>
                  }
                >
                  <table class="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr class="border-b-2 border-purple-200 bg-purple-50">
                        <th class="text-left py-2 px-3 w-10 text-gray-600 font-medium">Sn.</th>
                        <th class="text-left py-2 px-3 text-gray-600 font-medium">Course Title</th>
                        <th class="text-left py-2 px-3 text-gray-600 font-medium">Code</th>
                        <th class="text-center py-2 px-3 text-gray-600 font-medium w-16">CH</th>
                        <th class="text-right py-2 px-3 text-gray-600 font-medium">Unit Cost</th>
                        <th class="text-right py-2 px-3 text-gray-600 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-purple-50">
                      <For each={addedCourses}>
                        {(course, i) => (
                          <tr class="hover:bg-purple-50 transition-colors">
                            <td class="py-2 px-3 font-medium text-purple-800">{i() + 1}.</td>
                            <td class="py-2 px-3">
                              <Show when={detAddedCourses[course]} fallback={<span class="text-gray-400 italic">Loading...</span>}>
                                {detAddedCourses[course][0]}
                              </Show>
                            </td>
                            <td class="py-2 px-3 font-mono font-medium text-purple-700">
                              <Show when={course} fallback={<span class="text-gray-400 italic">Loading...</span>}>
                                {course}
                              </Show>
                            </td>
                            <td class="py-2 px-3 text-center font-medium">
                              <Show when={detAddedCourses[course]} fallback={<span class="text-gray-400">–</span>}>
                                {detAddedCourses[course][1]}
                              </Show>
                            </td>
                            <td class="py-2 px-3 text-right font-mono">
                              <Show when={detAddedCourses[course]} fallback={<span class="text-gray-400">–</span>}>
                                {formatter.format(detAddedCourses[course][2])}
                              </Show>
                            </td>
                            <td class="py-2 px-3 text-right font-mono font-semibold text-purple-900">
                              <Show when={detAddedCourses[course]} fallback={<span class="text-gray-400">–</span>}>
                                {formatter.format(detAddedCourses[course][3])}
                              </Show>
                            </td>
                          </tr>
                        )}
                      </For>
                      
                      {/* Added Subtotal */}
                      <tr class="bg-gradient-to-r from-purple-50 to-amber-50 font-semibold border-t-2 border-purple-200">
                        <td class="py-3 px-3" colSpan={3}>Sub Total (Added)</td>
                        <td class="py-3 px-3 text-center font-medium">{addedTotalCU()}</td>
                        <td class="py-3 px-3"></td>
                        <td class="py-3 px-3 text-right font-mono text-purple-900">
                          {formatter.format(parseInt(addedTotalProgFee()))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Show>
              </div>
            </section>

            {/* ===== SUMMARY OF FEES ===== */}
            <section class="border-2 border-purple-100 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 via-white to-amber-50">
              <div class="bg-purple-900 text-amber-100 px-5 py-3">
                <h2 class="font-bold text-lg tracking-wide">:: Summary of Fees</h2>
              </div>
              
              <div class="p-6">
                <div class="grid md:grid-cols-3 gap-6 text-sm">
                  {/* Wallet Before */}
                  <div class="text-center p-4 bg-white rounded-lg border border-purple-100">
                    <span class="block text-xs uppercase tracking-wider text-gray-500 mb-2">Portal Wallet (Before)</span>
                    <span class="block text-xl font-bold font-mono text-purple-900">
                      {formatter.format(parseInt(openingBalance()))}
                    </span>
                  </div>
                  
                  {/* Total Charges */}
                  <div class="text-center p-4 bg-white rounded-lg border border-purple-100">
                    <span class="block text-xs uppercase tracking-wider text-gray-500 mb-2">Total Charges (Added)</span>
                    <span class="block text-xl font-bold font-mono text-amber-700">
                      {formatter.format(parseInt(addedTotalProgFee()))}
                    </span>
                  </div>
                  
                  {/* Wallet After */}
                  <div class="text-center p-4 bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg text-amber-100">
                    <span class="block text-xs uppercase tracking-wider opacity-90 mb-2">Portal Wallet (After)</span>
                    <span class="block text-xl font-bold font-mono">
                      {formatter.format(parseInt(closingBalance()))}
                    </span>
                  </div>
                </div>
                
                {/* Net Change Indicator */}
                <div class="mt-4 text-center text-xs text-gray-500">
                  <Show 
                    when={parseInt(addedTotalProgFee()) > 0}
                    fallback={
                      <span class="text-amber-700 font-medium">✓ No additional charges applied</span>
                    }
                  >
                    <span class="text-purple-700 font-medium">
                      Net debit from wallet: {formatter.format(parseInt(addedTotalProgFee()))}
                    </span>
                  </Show>
                </div>
              </div>
            </section>

            {/* ===== SIGNATURES & QR ===== */}
            <section class="border-2 border-purple-100 rounded-xl overflow-hidden">
              <div class="bg-purple-900 text-amber-100 px-5 py-3">
                <h2 class="font-bold text-lg tracking-wide">:: Authorizations</h2>
              </div>
              
              <div class="p-6 bg-white">
                <div class="grid md:grid-cols-5 gap-6 items-end">
                  {/* Signature Blocks */}
                  <div class="md:col-span-4 grid sm:grid-cols-2 gap-6">
                    {[
                      { label: "Head of Department", num: 1 },
                      { label: "Dean of Faculty", num: 2 },
                      { label: "Bursar", num: 3 },
                      { label: "Registrar", num: 4 }
                    ].map((sig) => (
                      <div key={sig.num} class="text-center">
                        <div class="border-b-2 border-dashed border-purple-300 h-16 mb-2"></div>
                        <span class="block text-xs text-gray-500 mb-1">[{sig.num}] Signature & Date</span>
                        <span class="block font-medium text-purple-900 text-sm">{sig.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* QR Code */}
                  <div class="text-center">
                    <div class="inline-block p-2 border-2 border-amber-300 rounded-lg bg-white shadow-sm">
                      <img
                        class="w-24 h-24"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=jets`}
                        alt="Verification QR"
                      />
                    </div>
                    <span class="block text-xs text-gray-500 mt-2 font-mono">QRETSK</span>
                    <Show when={formNumber()}>
                      <span class="block text-xs text-purple-700 font-mono mt-1">Ref: {formNumber()}</span>
                    </Show>
                    <Show fallback={<>AD{params.customId}</>} when={formNumber()}>
                      <span class="block text-xs text-purple-700 font-mono">{formNumber()}</span>
                    </Show>
                  </div>
                </div>
                
                {/* Footer Note */}
                <div class="mt-8 pt-4 border-t border-purple-100 text-center text-xs text-gray-500">
                  <p>This Add/Drop form is valid upon approval by all designated authorities.</p>
                  <p class="mt-1 font-medium text-purple-700">ECWA Theological Seminary, KAGORO • Academic Affairs</p>
                </div>
              </div>
            </section>

          </div>
          
          {/* Print Footer */}
          <footer class="no-print text-center py-4 text-xs text-gray-500 border-t border-purple-100 bg-purple-50">
            Generated on {new Date().toLocaleDateString()} • For verification, scan QR code or visit portal
          </footer>
        </div>
      </>
    </MetaProvider>
  );
}
