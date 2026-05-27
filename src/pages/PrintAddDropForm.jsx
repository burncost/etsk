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
      <div class="text-xs">
        <div
          onClick={() => printNow()}
          class="no-print bg-purple-900 text-white text-lg text-center py-4 cursor-pointer hover:opacity-60"
        >
          Click here to Print
        </div>
        <div class="mx-auto space-y-4">
          <div class="px-6">
            <Show
              when={registrationData.loading}
              fallback={
                <>
                  <h2 class="flex text-center pb-2 border-b border-red-200">
                    <div class="w-14">
                      <img src="/small-logo.png" class="w-full" />
                    </div>
                    <div class="grow text-center font-semibold pt-2">
                      <h1 class="text-xl">
                        ECWA Theological Seminary, KAGORO (ETSK)
                      </h1>
                      <p>
                        <Show
                          when={
                            registrationData().studentReg.current_level ===
                              "5" ||
                            registrationData().studentReg.current_level ===
                              "6" ||
                            registrationData().studentReg.current_level === "7"
                          }
                          fallback={<>Undergraduate</>}
                        >
                          Postgraduate
                        </Show>{" "}
                        Student Online Add/Drop
                      </p>
                    </div>
                    <div class="pt-3">
                      <b>Form No.: </b>
                      <br />
                      <Show
                        fallback={<>AD{params.customId}</>}
                        when={formNumber()}
                      >
                        {formNumber()}
                      </Show>
                    </div>
                  </h2>
                  <div class="mt-6 space-y-6">
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
                            <td class="p-1">
                              <b>Year of Admission:</b>&nbsp;
                              <span>
                                {registrationData().student.year_of_admission}
                              </span>
                            </td>

                            <td class="p-1">
                              <b>Today's Date:</b>&nbsp;
                              <span>
                                {new Date().getDate()}-
                                {new Date().getMonth() + 1}-
                                {new Date().getFullYear()}
                              </span>
                            </td>
                            <td class="p-1">
                              <b>Academic Session:</b>&nbsp;
                              <span>{registrationData().period.session}</span>
                            </td>
                            <td class="p-1">
                              <b>Semester:</b>&nbsp;
                              <span class="uppercase">
                                {registrationData().period.semester}
                              </span>
                            </td>
                            <td class="p-1" rowSpan={4}>
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
                            <td class="p-1">
                              <b>Name:</b>&nbsp;
                              <b class="uppercase">
                                {registrationData().user.surname}
                              </b>{" "}
                              <span>{registrationData().user.first_name}</span>{" "}
                              <span>{registrationData().user.other_names}</span>
                            </td>
                            <td class="p-1">
                              <b>Gender:</b>&nbsp;
                              <span class="uppercase">
                                {registrationData().user.gender}
                              </span>
                            </td>
                            <td class="p-1">
                              <b>Phone Number:</b>&nbsp;
                              <span>
                                {registrationData().user.phone_number}
                              </span>
                            </td>
                            <td class="p-1">
                              <b>Email:</b>&nbsp;
                              <span>{registrationData().student.email}</span>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1">
                              <b>Ledger No.:</b>&nbsp;
                              {registrationData().student.ledger_number}
                            </td>
                            <td class="p-1">
                              <b>Mat. No.:</b>&nbsp;
                              <span class="uppercase">
                                {
                                  registrationData().student
                                    .matriculation_number
                                }
                              </span>
                            </td>
                            <td class="p-1">
                              <b>Special St. Cat:</b>&nbsp;
                              <span>
                                {
                                  registrationData().student
                                    .special_student_category
                                }
                              </span>
                            </td>
                            <td class="p-1">
                              <b>Denomination:</b>&nbsp;
                              <span>
                                {registrationData().student.denomination}
                              </span>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1">
                              <b>Programme:</b>&nbsp;
                              {registrationData().student.programme}
                            </td>
                            <td class="p-1">
                              <b>Mode of Study:</b>&nbsp;
                              {modeOfStudy()}
                            </td>
                            <td class="p-1">
                              <b>Affiliation No.:</b>&nbsp;
                              <span class="uppercase">
                                {registrationData().student.affiliation_status}
                              </span>
                            </td>
                            <td class="p-1">
                              <b>Current Level:</b>&nbsp;
                              <span>
                                {registrationData().studentReg.current_level}
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
                            <th class="p-1 text-left uppercase" colSpan={6}>
                              :: DROPPED COURSES
                            </th>
                          </tr>
                          <tr class="border-b border-black bg-gray-300">
                            <th class="p-1 text-left border-r border-black">
                              Sn.
                            </th>
                            <th class="p-1 text-left border-r border-black">
                              Title
                            </th>
                            <th class="p-1 text-left border-r border-black">
                              Code
                            </th>
                            <th class="p-1 text-left border-r border-black">
                              CH
                            </th>
                            <th class="p-1 text-left border-r border-black">
                              Unit Cost
                            </th>
                            <th class="p-1 text-left">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <Show
                            when={droppedCourses}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={6} class="p-1 text-center">
                                  No course(s) dropped.
                                </td>
                              </tr>
                            }
                          >
                            <For each={droppedCourses}>
                              {(course, i) => (
                                <tr class="border-b border-black">
                                  <td class="p-1 border-r border-black font-semibold">
                                    {i() + 1}.
                                  </td>
                                  <td class="p-1 border-r border-black">
                                    <Show
                                      when={detDroppedCourses[course]}
                                      fallback={<>Fetching.. .</>}
                                    >
                                      {detDroppedCourses[course][0]}
                                    </Show>
                                  </td>
                                  <td class="p-1 border-r border-black">
                                    <Show
                                      when={course}
                                      fallback={<>Fetching.. .</>}
                                    >
                                      {course}
                                    </Show>
                                  </td>
                                  <td class="p-1 border-r border-black">
                                    <Show
                                      when={detDroppedCourses[course]}
                                      fallback={<>Fetching.. .</>}
                                    >
                                      {detDroppedCourses[course][1]}
                                    </Show>
                                  </td>
                                  <td class="p-1 border-r border-black">
                                    <Show
                                      when={detDroppedCourses[course]}
                                      fallback={<>Fetching.. .</>}
                                    >
                                      {formatter.format(
                                        detDroppedCourses[course][2]
                                      )}
                                    </Show>
                                  </td>
                                  <td class="p-1">
                                    <Show
                                      when={detDroppedCourses[course]}
                                      fallback={<>Fetching.. .</>}
                                    >
                                      {formatter.format(
                                        detDroppedCourses[course][3]
                                      )}
                                    </Show>
                                  </td>
                                </tr>
                              )}
                            </For>
                            <tr class="border-b border-black">
                              <td
                                class="font-semibold p-1 border-r border-black"
                                colSpan={3}
                              >
                                Sub Total
                              </td>
                              <td class="font-semibold p-1 border-r border-black">
                                {droppedTotalCU()}
                              </td>
                              <td class="p-1 border-r border-black">&nbsp;</td>
                              <td class="font-semibold p-1">
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
                      <table cellPadding={0} cellSpacing={0} class="w-full">
                        <thead>
                          <tr class="bg-white border-b border-black text-blue-900">
                            <th class="p-1 text-left uppercase" colSpan={6}>
                              :: ADDED COURSES
                            </th>
                          </tr>
                          <tr class="border-b border-black bg-gray-300">
                            <th class="p-1 text-left border-r border-black">
                              Sn.
                            </th>
                            <th class="p-1 text-left border-r border-black">
                              Title
                            </th>
                            <th class="p-1 text-left border-r border-black">
                              Code
                            </th>
                            <th class="p-1 text-left border-r border-black">
                              CH
                            </th>
                            <th class="p-1 text-left border-r border-black">
                              Unit Cost
                            </th>
                            <th class="p-1 text-left">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <Show
                            when={addedCourses}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={6} class="p-1 text-center">
                                  No course(s) added.
                                </td>
                              </tr>
                            }
                          >
                            <For each={addedCourses}>
                              {(course, i) => (
                                <tr class="border-b border-black">
                                  <td class="p-1 border-r border-black font-semibold">
                                    {i() + 1}.
                                  </td>
                                  <td class="p-1 border-r border-black">
                                    <Show
                                      when={detAddedCourses[course]}
                                      fallback={<>Fetching.. .</>}
                                    >
                                      {detAddedCourses[course][0]}
                                    </Show>
                                  </td>
                                  <td class="p-1 border-r border-black">
                                    <Show
                                      when={course}
                                      fallback={<>Fetching.. .</>}
                                    >
                                      {course}
                                    </Show>
                                  </td>
                                  <td class="p-1 border-r border-black">
                                    <Show
                                      when={detAddedCourses[course]}
                                      fallback={<>Fetching.. .</>}
                                    >
                                      {detAddedCourses[course][1]}
                                    </Show>
                                  </td>
                                  <td class="p-1 border-r border-black">
                                    <Show
                                      when={detAddedCourses[course]}
                                      fallback={<>Fetching.. .</>}
                                    >
                                      {formatter.format(
                                        detAddedCourses[course][2]
                                      )}
                                    </Show>
                                  </td>
                                  <td class="p-1">
                                    <Show
                                      when={detAddedCourses[course]}
                                      fallback={<>Fetching.. .</>}
                                    >
                                      {formatter.format(
                                        detAddedCourses[course][3]
                                      )}
                                    </Show>
                                  </td>
                                </tr>
                              )}
                            </For>
                            <tr class="border-b border-black">
                              <td
                                class="font-semibold p-1 border-r border-black"
                                colSpan={3}
                              >
                                Sub Total
                              </td>
                              <td class="font-semibold p-1 border-r border-black">
                                {addedTotalCU()}
                              </td>
                              <td class="p-1 border-r border-black">&nbsp;</td>
                              <td class="font-semibold p-1">
                                {formatter.format(
                                  parseInt(addedTotalProgFee())
                                )}
                              </td>
                            </tr>
                          </Show>
                        </tbody>
                      </table>
                    </div>
                    <div class="overflow-x-auto">
                      <table cellPadding={0} cellSpacing={0} class="w-full">
                        <thead>
                          <tr class="bg-white border-b border-black text-blue-900">
                            <th class="p-1 text-left uppercase">
                              :: SUMMARY OF FEES
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="border-b border-black">
                            <td class="p-1">
                              <span class="flex justify-between">
                                <span>
                                  Portal Wallet Before Add/Drop:{" "}
                                  <b>
                                    {formatter.format(
                                      parseInt(openingBalance())
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
                                  Portal Wallet After Add/Drop:{" "}
                                  <b>
                                    {formatter.format(
                                      parseInt(closingBalance())
                                    )}
                                  </b>
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
                              :: SIGNATURES
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="border-b border-black text-center">
                            <td class="p-1">
                              <div class="grid grid-cols-4 gap-1">
                                <div class="col-span-3 grid grid-cols-2 gap-8 py-8">
                                  <div class="">
                                    [1] <b>Sign:</b> ........................{" "}
                                    <b>Date:</b> .....................
                                    <br />
                                    Head of Department
                                  </div>
                                  <div class="">
                                    [2] <b>Sign:</b> ........................{" "}
                                    <b>Date:</b> ........................
                                    <br />
                                    Dean of Faculty
                                  </div>
                                  <div class="">
                                    [3] <b>Sign:</b> ........................{" "}
                                    <b>Date:</b> ........................
                                    <br />
                                    Bursar
                                  </div>
                                  <div class="">
                                    [4] <b>Sign:</b> ........................{" "}
                                    <b>Date:</b> ........................
                                    <br />
                                    Registrar
                                  </div>
                                </div>
                                <div class="text-center py-2">
                                  <img
                                    class="mx-auto"
                                    src={
                                      "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=jets"
                                    }
                                  />
                                  {/* QRCode from: https://goqr.me/api/ */}
                                  <span class="text-xs text-right">
                                    QRETSK {formNumber()}
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              }
            >
              <Loading />
            </Show>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
