import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";
import { Match, Show, Switch, createResource, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import Loading from "../components/Loading";

export default function PrintRegistrationForm() {
  const [user, setUser] = createStore();
  const [student, setStudent] = createStore();
  const [studentReg, setStudentReg] = createStore();
  const [adminCharges, setAdminCharges] = createStore();
  const [period, setPeriod] = createStore();
  const [openingBal, setOpeningBal] = createSignal(0);
  const [closingBal, setClosingBal] = createSignal(0);

  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  const [regStatus, setRegStatus] = createSignal("");
  const [formNumber, setFormNumber] = createSignal("");
  const [pickedCourses, setPickedCourses] = createStore([]);
  const [detPickedCourses, setDetPickedCourses] = createStore([]);
  const [totalCU, setTotalCU] = createSignal(0);
  const [totalProgFee, setTotalProgFee] = createSignal(0);

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
      
      if (result.response === "Expired token") {
        localStorage.removeItem("jetsUser");
        navigate("/", { replace: true });
      } 
      else {
        var registration = await fetchRegistration();

        if (registration.registration_status !== "completed") {
          if (
            JSON.parse(localStorage.getItem("jetsUser")).user_role === "admin"
          ) {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/student/downloads", { replace: true });
          }
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

          // get current year
          const currentYear = new Date().getFullYear();
          
          Promise.all([request0, request1, request2, request3])
            .then(([data0, data1, data2, data3]) => {
              setStudent(data1.response);
              setAdminCharges(JSON.parse(registration.seminary_charges));
              setStudentReg(registration);
              setRegStatus(registration.registration_status);
              setOpeningBal(registration.registration_opening_balance);
              setClosingBal(registration.registration_closing_balance);
              setFormNumber(
                registration.form_number || `${registration.id}P${currentYear}`
              );
              setPeriod(data2.response);
              setUser(data0.response);
              // console.log(period.semester)

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
        openingBal,
        closingBal,
        formNumber,
      };
    } else {
      navigate("/", { replace: true });
    }
  };

  const c = {};
  var total_cu = 0;
  var total_amt = 0;
  const getCourseDetails = async (arr) => {
    for (let i = 0; i < arr.length; i++) {
      try {
        var _denomination = student.denomination
        var _department = student.department
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
            var display_course_hrs = "P/F";

            var sub_amount = parseInt(course_amount) * 1;
          } 
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
          else {
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

  const getTotalAdmin = () => {
    var t =
      parseInt(adminCharges["ACTEA Accreditation/Services"]) +
      parseInt(adminCharges["Administrative Services"]) +
      parseInt(adminCharges["Campus Development Levy"]) +
      parseInt(adminCharges["Computer IT Dev and Internet Access"]) +
      parseInt(adminCharges["Departmental Charges"]) +
      parseInt(adminCharges["ECWA Education Dept Levy"]) +
      parseInt(adminCharges["Examination/Stationery"]) +
      parseInt(adminCharges["Health Insurance"]) +
      parseInt(adminCharges["Late Registration Charges"]) +
      parseInt(adminCharges["Library Use and Services"]) +
      parseInt(adminCharges["New Student Matriculation"]) +
      parseInt(adminCharges["SUG Charges"]) +
      parseInt(adminCharges["Seminary Student/Library ID Card"]);
    return t;
  };

  const printNow = async () => {
    if (JSON.parse(localStorage.getItem("jetsUser")).surname === "bursar") {
      var theData = {
        period_id: params.periodId,
        registration_print_bursar: "yes",
      };
    }
    if (JSON.parse(localStorage.getItem("jetsUser")).surname === "dean") {
      var theData = {
        period_id: params.periodId,
        registration_print_dean: "yes",
      };
    }
    if (JSON.parse(localStorage.getItem("jetsUser")).surname === "registrar") {
      var theData = {
        period_id: params.periodId,
        registration_print_registry: "yes",
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
      <Title>
        Print Registration Form - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="Print Registration Form on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <>
        <Show
          when={registrationData.loading}
          fallback={
            <>
              <div
                onClick={() => printNow()}
                class="no-print bg-purple-900 text-white text-lg text-center py-4 cursor-pointer hover:opacity-60"
              >
                Click here to Print
              </div>
              <div class="px-8 w-full text-xs space-y-4">
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
                          registrationData().studentReg.current_level === "5" ||
                          registrationData().studentReg.current_level === "6" ||
                          registrationData().studentReg.current_level === "7"
                        }
                        fallback={<>Undergraduate</>}
                      >
                        Postgraduate
                      </Show>{" "}
                      Student Online Enrollment
                    </p>
                  </div>
                  <div class="pt-3 italics">
                    <b>Form No.: </b>
                    <br />
                    <Show when={formNumber()}>R{formNumber()}</Show>
                  </div>
                </h2>
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
                          <td class="p-1">
                            <b>Year of Admission:</b>&nbsp;
                            <span>
                              {registrationData().student.year_of_admission}
                            </span>
                          </td>

                          <td class="p-1">
                            <b>Today's Date:</b>&nbsp;
                            <span>
                              {new Date().getDate()}-{new Date().getMonth() + 1}
                              -{new Date().getFullYear()}
                            </span>
                          </td>
                          <td class="p-1">
                            <b>Academic Session:</b>&nbsp;
                            <span>{registrationData().period.session}</span>
                          </td>
                          <td class="p-1">
                            <b>Semester(s):</b>&nbsp;
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
                            <span>{registrationData().user.phone_number}</span>
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
                              {registrationData().student.matriculation_number}
                            </span>
                          </td>
                          <td class="p-1">
                            <b>Special St. Cat:</b>&nbsp;
                            <span class="capitalize">
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
                            <b>Affiliation Status:</b>&nbsp;
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
                                ({registrationData().studentReg.fresh_returning}{" "}
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
                          <td class="p-1 border-r border-black">Sn.</td>
                          <td class="p-1 border-r border-black">Item</td>
                          <td class="p-1">Amount</td>
                        </tr>
                        {/*populate in person admin/seminary charges */}
                        <Show when={(modeOfStudy() !=="Virtual")}>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              1.
                            </td>
                            <td class="p-1 border-r border-black">SUG Charges</td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges["SUG Charges"]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "SUG Charges"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              2.
                            </td>
                            <td class="p-1 border-r border-black">
                              Health Insurance
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Health Insurance"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Health Insurance"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              3.
                            </td>
                            <td class="p-1 border-r border-black">
                              Departmental Charges
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Departmental Charges"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Departmental Charges"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              4.
                            </td>
                            <td class="p-1 border-r border-black">
                              Examination/Stationery
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Examination/Stationery"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Examination/Stationery"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              5.
                            </td>
                            <td class="p-1 border-r border-black">
                              Administrative Services
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Administrative Services"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Administrative Services"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              6.
                            </td>
                            <td class="p-1 border-r border-black">
                              Campus Development Levy
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Campus Development Levy"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Campus Development Levy"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              7.
                            </td>
                            <td class="p-1 border-r border-black">
                              ECWA Education Dept Levy
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "ECWA Education Dept Levy"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "ECWA Education Dept Levy"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              8.
                            </td>
                            <td class="p-1 border-r border-black">
                              Library Use and Services
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Library Use and Services"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Library Use and Services"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              9.
                            </td>
                            <td class="p-1 border-r border-black">
                              New Student Matriculation
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "New Student Matriculation"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "New Student Matriculation"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              10.
                            </td>
                            <td class="p-1 border-r border-black">
                              ICT Development and Internet Access
                            </td>
                            <td class="p-1">
                              {/* {console.log(registrationData())} */}
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "ICT Dev and Internet Access"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "ICT Dev and Internet Access"
                                  ][0]
                                )}
                              </Show>
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Computer IT Dev and Internet Access"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Computer IT Dev and Internet Access"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              11.
                            </td>
                            <td class="p-1 border-r border-black">
                              Seminary Student/Library ID Card
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Seminary Student/Library ID Card"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Seminary Student/Library ID Card"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              12.
                            </td>
                            <td class="p-1 border-r border-black">
                              Academic Catalogue
                            </td>
                            <td class="p-1">
                              {formatter.format(
                                registrationData().adminCharges[
                                  "Academic Catalogue"
                                ]
                                  ? registrationData().adminCharges[
                                      "Academic Catalogue"
                                    ]
                                  : 0
                              )}
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              13.
                            </td>
                            <td class="p-1 border-r border-black">
                              Late Registration
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Late Registration"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Late Registration"
                                  ][0]
                                )}
                              </Show>
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Late Registration Charges"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Late Registration Charges"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              14.
                            </td>
                            <td class="p-1 border-r border-black">
                              ACTEA Accreditation/Services
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "ACTEA Accreditation/Services"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "ACTEA Accreditation/Services"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td
                              class="p-1 border-r border-black font-semibold"
                              colSpan={2}
                            >
                              Sub Total
                            </td>
                            <td class="p-1 font-semibold">
                              <Show
                                when={pickedCourses.length < 2}
                                fallback={
                                  <Show
                                    when={
                                      registrationData().adminCharges["total"]
                                    }
                                    fallback={
                                      <Show when={getTotalAdmin()} fallback={0}>
                                        {formatter.format(getTotalAdmin())}
                                      </Show>
                                    }
                                  >
                                    {formatter.format(
                                      registrationData().adminCharges["total"][0]
                                    )}
                                  </Show>
                                }
                              >
                                <Show
                                  when={registrationData().adminCharges["total"]}
                                  fallback={
                                    <Show when={getTotalAdmin()} fallback={0}>
                                      {formatter.format(getTotalAdmin())}
                                    </Show>
                                  }
                                >
                                  {formatter.format(
                                    registrationData().adminCharges["total"][0] -
                                      parseInt(0)
                                  )}
                                </Show>{" "}
                                {/* (For less than 2 Courses) */}
                              </Show>
                            </td>
                          </tr>
                        </Show>

                        {/*populate online admin/seminary charges */}
                        <Show when={(modeOfStudy() === "Virtual")}>
                        <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              1.
                            </td>
                            <td class="p-1 border-r border-black">
                              Departmental Charges
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Departmental Charges"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Departmental Charges"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              2.
                            </td>
                            <td class="p-1 border-r border-black">
                              ECWA Education Dept Levy
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "ECWA Education Dept Levy"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "ECWA Education Dept Levy"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              3.
                            </td>
                            <td class="p-1 border-r border-black">
                              Development for Online Capacity
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Development for Online Capacity"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Development for Online Capacity"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td class="p-1 border-r border-black font-semibold">
                              4.
                            </td>
                            <td class="p-1 border-r border-black">
                              Internet and Portal Access
                            </td>
                            <td class="p-1">
                              <Show
                                when={
                                  registrationData().adminCharges[
                                    "Internet and Portal Access"
                                  ]
                                }
                              >
                                {formatter.format(
                                  registrationData().adminCharges[
                                    "Internet and Portal Access"
                                  ][0]
                                )}
                              </Show>
                            </td>
                          </tr>
                          <tr class="border-b border-black">
                            <td
                              class="p-1 border-r border-black font-semibold"
                              colSpan={2}
                            >
                              Sub Total
                            </td>
                            <td class="p-1 font-semibold">
                              <Show
                                when={pickedCourses.length < 2}
                                fallback={
                                  <Show
                                    when={
                                      registrationData().adminCharges["total"]
                                    }
                                    fallback={
                                      <Show when={getTotalAdmin()} fallback={0}>
                                        {formatter.format(getTotalAdmin())}
                                      </Show>
                                    }
                                  >
                                    {formatter.format(
                                      registrationData().adminCharges["total"][0]
                                    )}
                                  </Show>
                                }
                              >
                                <Show
                                  when={registrationData().adminCharges["total"]}
                                  fallback={
                                    <Show when={getTotalAdmin()} fallback={0}>
                                      {formatter.format(getTotalAdmin())}
                                    </Show>
                                  }
                                >
                                  {formatter.format(
                                    registrationData().adminCharges["total"][0] -
                                      parseInt(0)
                                  )}
                                </Show>{" "}
                                {/* (For less than 2 Courses) */}
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
                  <div class="overflow-x-auto">
                    <table cellPadding={0} cellSpacing={0} class="w-full">
                      <thead>
                        <tr class="bg-white border-b border-black text-blue-900">
                          <th class="p-1 text-left uppercase" colSpan={6}>
                            :: PROGRAMME ({registrationData().student.programme}
                            )
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
                        <Show when={pickedCourses}>
                          <For each={pickedCourses}>
                            {(course, i) => (
                              <tr class="border-b border-black">
                                <td class="p-1 border-r border-black font-semibold">
                                  {i() + 1}.
                                </td>
                                <td class="p-1 border-r border-black">
                                  <Show
                                    when={detPickedCourses[course]}
                                    fallback={<>Fetching.. .</>}
                                  >
                                    {detPickedCourses[course][0]}
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
                                    when={detPickedCourses[course]}
                                    fallback={<>Fetching.. .</>}
                                  >
                                    {detPickedCourses[course][1]}
                                  </Show>
                                </td>
                                <td class="p-1 border-r border-black">
                                  <Show
                                    when={detPickedCourses[course]}
                                    fallback={<>Fetching.. .</>}
                                  >
                                    {formatter.format(
                                      detPickedCourses[course][2]
                                    )}
                                  </Show>
                                </td>
                                <td class="p-1">
                                  <Show
                                    when={detPickedCourses[course]}
                                    fallback={<>Fetching.. .</>}
                                  >
                                    {formatter.format(
                                      detPickedCourses[course][3]
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
                              Sub Total{" "}
                              <Show
                                when={
                                  registrationData().student
                                    .special_student_category === "jets staff"
                                }
                              >
                                (ETSK Staff)
                              </Show>
                            </td>
                            <td class="font-semibold p-1 border-r border-black">
                              {totalCU()}
                            </td>
                            <td class="p-1 border-r border-black">&nbsp;</td>
                            <td class="font-semibold p-1">
                              <Show
                                when={
                                  registrationData().student
                                    .special_student_category === "jets staff"
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
                          <td class="p-1 grid grid-cols-3 gap-4">
                            <span>
                              Portal Wallet Before Registration:
                              <br />
                              <b>
                                {formatter.format(
                                  registrationData().openingBal()
                                )}
                              </b>
                            </span>
                            <span>
                              Seminary Charges:
                              <br />
                              <b>
                                <Show
                                  when={pickedCourses.length < 2}
                                  fallback={
                                    <Show
                                      when={
                                        registrationData().adminCharges["total"]
                                      }
                                      fallback={
                                        <Show
                                          when={getTotalAdmin()}
                                          fallback={0}
                                        >
                                          {formatter.format(getTotalAdmin())}
                                        </Show>
                                      }
                                    >
                                      {formatter.format(
                                        registrationData().adminCharges[
                                          "total"
                                        ][0]
                                      )}
                                    </Show>
                                  }
                                >
                                  <Show
                                    when={
                                      registrationData().adminCharges["total"]
                                    }
                                    fallback={
                                      <Show when={getTotalAdmin()} fallback={0}>
                                        {formatter.format(getTotalAdmin())}
                                      </Show>
                                    }
                                  >
                                    {formatter.format(
                                      registrationData().adminCharges[
                                        "total"
                                      ][0] - parseInt(0)
                                    )}
                                  </Show>
                                </Show>
                              </b>
                            </span>
                            <span>
                              Programme Fees:
                              <br />
                              <b>
                                {formatter.format(parseInt(totalProgFee()))}
                              </b>
                            </span>
                            <span>
                              <Show when={registrationData().student.affiliation_status === "yes" && period.semester==="1st"}>
                                Affiliaton Fee:
                                <br/>
                                <b>
                                  {formatter.format(
                                    parseInt(40000)
                                  )}
                                </b>
                              </Show>
                            </span>
                            <span>
                              Total Charges:
                              <br />
                              <b>
                                <Show
                                  when={pickedCourses.length < 2}
                                  fallback={
                                    <Show
                                      when={registrationData().adminCharges["total"]}
                                      fallback={
                                        <span>
                                          {formatter.format(
                                            parseInt(getTotalAdmin()) +
                                            parseInt(totalProgFee()) +
                                            (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                          )}
                                        </span>
                                      }
                                    >
                                      {formatter.format(
                                        parseInt(registrationData().adminCharges["total"][0]) +
                                        parseInt(totalProgFee()) +
                                        (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                      )}
                                    </Show>
                                  }
                                >
                                  <Show
                                    when={registrationData().adminCharges["total"]}
                                    fallback={
                                      <span>
                                        {formatter.format(
                                          parseInt(getTotalAdmin()) +
                                          parseInt(totalProgFee()) +
                                          (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                        )}
                                      </span>
                                    }
                                  >
                                    {formatter.format(
                                      parseInt(registrationData().adminCharges["total"][0]) +
                                      parseInt(totalProgFee()) +
                                      (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                    )}
                                  </Show>
                                </Show>
                              </b>
                            </span>
                            <span>
                              Portal Wallet After Registration:
                              <br />
                              <b>
                              <Show
                                  when={pickedCourses.length < 2}
                                  fallback={
                                    <Show
                                      when={registrationData().adminCharges["total"]}
                                      fallback={
                                        <span>
                                          {formatter.format(
                                            parseInt(registrationData().openingBal()) -
                                             (parseInt(getTotalAdmin()) +
                                            parseInt(totalProgFee()) +
                                            (registrationData().student.affiliation_status === "yes" ? 40000 : 0))
                                          )}
                                        </span>
                                      }
                                    >
                                      {formatter.format(
                                        parseInt(registrationData().openingBal()) - (
                                        parseInt(registrationData().adminCharges["total"][0]) +
                                        parseInt(totalProgFee()) +
                                        (registrationData().student.affiliation_status === "yes" && period.semester==="1st"? 40000 : 0))
                                      )}
                                    </Show>
                                  }
                                >
                                  <Show
                                    when={registrationData().adminCharges["total"]}
                                    fallback={
                                      <span>
                                        {formatter.format(
                                          parseInt(registrationData().openingBal()) -
                                          (parseInt(getTotalAdmin()) +
                                          parseInt(totalProgFee()) +
                                          (registrationData().student.affiliation_status === "yes" ? 40000 : 0))
                                        )}
                                      </span>
                                    }
                                  >
                                    {formatter.format(
                                      parseInt(registrationData().openingBal()) -
                                      (parseInt(registrationData().adminCharges["total"][0]) +
                                      parseInt(totalProgFee()) +
                                      (registrationData().student.affiliation_status === "yes" ? 40000 : 0))
                                    )}
                                  </Show>
                                </Show>
                                {/* {formatter.format(
                                  registrationData().closingBal()
                                )}                               */}
                              </b>
                              
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
                          <th class="p-1 text-left uppercase">:: SIGNATURES</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="border-b border-black">
                          <td class="p-1 pt-6 grid grid-cols-5 gap-4 text-center">
                            <span class="col-span-4 grid gap-4 grid-cols-2">
                              <div>
                                [1] <b>Sign:</b> ........................{" "}
                                <b>Date:</b> .....................
                                <br />
                                Head of Department
                              </div>
                              <div>
                                [2] <b>Sign:</b> ........................{" "}
                                <b>Date:</b> ........................
                                <br />
                                Dean of Faculty
                              </div>
                              <div>
                                [3] <b>Sign:</b> ........................{" "}
                                <b>Date:</b> ........................
                                <br />
                                Bursar
                              </div>
                              <div>
                                [4] <b>Sign:</b> ........................{" "}
                                <b>Date:</b> ........................
                                <br />
                                Registrar
                              </div>
                            </span>
                            <span class="1">
                              <img
                                class="mx-auto"
                                src={
                                  "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=" +
                                  registrationData().formNumber()
                                }
                              />
                              {/* QRCode from: https://goqr.me/api/ */}
                              <span class="text-xs text-right">QRETSK</span>
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          }
        >
          <Loading />
        </Show>
      </>
    </MetaProvider>
  );
}
