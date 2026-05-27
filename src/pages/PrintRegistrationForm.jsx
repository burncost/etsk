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
        <Title>Print Registration Form - ECWA Theological Seminary, KAGORO (ETSK)</Title>
        <Meta
          name="description"
          content="Print Registration Form on ECWA Theological Seminary, KAGORO (ETSK)"
        />
        <>
          <Show
            when={registrationData.loading}
            fallback={
              <>
                {/* Print Action Bar - Hidden on Print */}
                <div
                  onClick={() => printNow()}
                  class="no-print bg-gradient-to-r from-purple-900 to-purple-700 text-white text-lg text-center py-4 cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                >
                  🖨️ Click Here to Print Registration Form
                </div>

                {/* Main Form Container - Academic Style */}
                <div class="bg-white text-gray-800 font-serif max-w-5xl mx-auto my-6 shadow-lg print:shadow-none print:m-0">
                  
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
                          <span class="text-gray-600">Student Online Enrollment</span>
                        </p>
                      </div>
                      
                      {/* Form Number */}
                      <div class="text-right">
                        <div class="bg-purple-900 text-amber-100 px-4 py-2 rounded-lg shadow-sm">
                          <span class="text-xs uppercase tracking-wider">Form No.</span>
                          <Show when={formNumber()}>
                            <div class="text-xl font-bold font-mono">R{formNumber()}</div>
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

                    {/* ===== SEMINARY CHARGES SECTION ===== */}
                    <section class="border-2 border-purple-100 rounded-xl overflow-hidden">
                      <div class="bg-purple-900 text-amber-100 px-5 py-3">
                        <h2 class="font-bold text-lg tracking-wide">:: Seminary Charges</h2>
                      </div>
                      
                      <div class="p-5 bg-white">
                        <table class="w-full text-sm">
                          <thead>
                            <tr class="border-b-2 border-purple-200">
                              <th class="text-left py-2 px-3 w-12 text-gray-500 font-medium">Sn.</th>
                              <th class="text-left py-2 px-3 text-gray-500 font-medium">Item</th>
                              <th class="text-right py-2 px-3 text-gray-500 font-medium">Amount (₦)</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-purple-50">
                            {/* In-Person Charges */}
                            <Show when={modeOfStudy() !== "Virtual"}>
                              <For each={[
                                "Compound Improvement", "Student Council/Departmental Fees", "Educators Levy",
                                "ID card", "Medical Deposit", "Matriculation Fee", "Sport fee",
                                "Library Charges", "Administrative Charges", "Cafe Fee", "Utility",
                                "ACTEA Accreditation/Services", "Seminary Book",
                              ]}>
                                {(chargeName, i) => (
                                  <tr class="hover:bg-purple-50 transition-colors">
                                    <td class="py-2 px-3 font-medium text-purple-800">{i() + 1}.</td>
                                    <td class="py-2 px-3">{chargeName}</td>
                                    <td class="py-2 px-3 text-right font-mono">
                                      <Show when={registrationData().adminCharges[chargeName]}>
                                        {formatter.format(registrationData().adminCharges[chargeName][0])}
                                        <Show
                                          when={
                                            JSON.parse(localStorage.getItem("jetsUser")).surname === "ict" ||
                                            JSON.parse(localStorage.getItem("jetsUser")).surname === "bursar"
                                          }
                                        >
                                          <span class="ml-2 text-amber-600 font-bold cursor-pointer hover:text-amber-800"
                                            onClick={() => editSingleCharge(chargeName)}>
                                            [Edit]
                                          </span>
                                        </Show>
                                      </Show>
                                    </td>
                                  </tr>
                                )}
                              </For>
                            </Show>

                            {/* Virtual Charges */}
                            <Show when={modeOfStudy() === "Virtual"}>
                              <For each={[
                                "Departmental Charges", "ECWA Education Dept Levy",
                                "Development for Online Capacity", "Internet and Portal Access"
                              ]}>
                                {(chargeName, i) => (
                                  <tr class="hover:bg-purple-50 transition-colors">
                                    <td class="py-2 px-3 font-medium text-purple-800">{i() + 1}.</td>
                                    <td class="py-2 px-3">{chargeName}</td>
                                    <td class="py-2 px-3 text-right font-mono">
                                      <Show when={registrationData().adminCharges[chargeName]}>
                                        {formatter.format(registrationData().adminCharges[chargeName][0])}
                                        <Show
                                          when={
                                            JSON.parse(localStorage.getItem("jetsUser")).surname === "ict" ||
                                            JSON.parse(localStorage.getItem("jetsUser")).surname === "bursar"
                                          }
                                        >
                                          <span class="ml-2 text-amber-600 font-bold cursor-pointer hover:text-amber-800"
                                            onClick={() => editSingleCharge(chargeName)}>
                                            [Edit]
                                          </span>
                                        </Show>
                                      </Show>
                                    </td>
                                  </tr>
                                )}
                              </For>
                            </Show>

                            {/* Sub Total */}
                            <tr class="bg-gradient-to-r from-purple-50 to-amber-50 font-semibold border-t-2 border-purple-200">
                              <td class="py-3 px-3" colSpan={2}>Sub Total</td>
                              <td class="py-3 px-3 text-right font-mono text-purple-900">
                                <Show when={registrationData().adminCharges["total"]}>
                                  {formatter.format(
                                    pickedCourses.length < 2
                                      ? parseInt(registrationData().adminCharges["total"][0])
                                      : parseInt(registrationData().adminCharges["total"][0])
                                  )}
                                </Show>
                              </td>
                            </tr>

                            {/* Affiliation Fee */}
                            <Show when={registrationData().student.affiliation_status === "yes" && period.semester==="1st"}>
                              <tr class="border-t-4 border-amber-400 mt-4">
                                <td colSpan={3} class="py-3 px-3">
                                  <span class="font-bold text-amber-800 uppercase tracking-wide">:: Affiliation Fee</span>
                                </td>
                              </tr>
                              <tr class="bg-amber-50 font-semibold">
                                <td class="py-3 px-3" colSpan={2}>Affiliation Fee (First Semester)</td>
                                <td class="py-3 px-3 text-right font-mono text-amber-800">
                                  {formatter.format("40000")}
                                </td>
                              </tr>
                            </Show>
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* ===== PROGRAMME / COURSES SECTION ===== */}
                    <section class="border-2 border-purple-100 rounded-xl overflow-hidden">
                      <div class="bg-purple-900 text-amber-100 px-5 py-3">
                        <h2 class="font-bold text-lg tracking-wide">
                          :: Programme ({registrationData().student.programme})
                        </h2>
                      </div>
                      
                      <div class="p-5 bg-white overflow-x-auto">
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
                            <Show when={pickedCourses}>
                              <For each={pickedCourses}>
                                {(course, i) => (
                                  <tr class="hover:bg-purple-50 transition-colors">
                                    <td class="py-2 px-3 font-medium text-purple-800">{i() + 1}.</td>
                                    <td class="py-2 px-3">
                                      <Show when={detPickedCourses[course]} fallback={<span class="text-gray-400 italic">Loading...</span>}>
                                        {detPickedCourses[course][0]}
                                      </Show>
                                    </td>
                                    <td class="py-2 px-3 font-mono font-medium text-purple-700">
                                      <Show when={course} fallback={<span class="text-gray-400 italic">Loading...</span>}>
                                        {course}
                                      </Show>
                                    </td>
                                    <td class="py-2 px-3 text-center font-medium">
                                      <Show when={detPickedCourses[course]} fallback={<span class="text-gray-400">–</span>}>
                                        {detPickedCourses[course][1]}
                                      </Show>
                                    </td>
                                    <td class="py-2 px-3 text-right font-mono">
                                      <Show when={detPickedCourses[course]} fallback={<span class="text-gray-400">–</span>}>
                                        {formatter.format(detPickedCourses[course][2])}
                                      </Show>
                                    </td>
                                    <td class="py-2 px-3 text-right font-mono font-semibold text-purple-900">
                                      <Show when={detPickedCourses[course]} fallback={<span class="text-gray-400">–</span>}>
                                        {formatter.format(detPickedCourses[course][3])}
                                      </Show>
                                    </td>
                                  </tr>
                                )}
                              </For>
                              
                              {/* Course Subtotal */}
                              <tr class="bg-gradient-to-r from-purple-50 to-amber-50 font-semibold border-t-2 border-purple-200">
                                <td class="py-3 px-3" colSpan={3}>
                                  Sub Total
                                  <Show when={registrationData().student.special_student_category === "jets staff"}>
                                    <span class="ml-2 text-amber-700 text-xs">(ETSK Staff Discount Applied)</span>
                                  </Show>
                                </td>
                                <td class="py-3 px-3 text-center font-medium">{totalCU()}</td>
                                <td class="py-3 px-3"></td>
                                <td class="py-3 px-3 text-right font-mono text-purple-900">
                                  <Show when={registrationData().student.special_student_category === "jets staff"}>
                                    <span class="line-through text-gray-400 text-xs block">
                                      {formatter.format(parseInt(totalProgFee()) * 2)}
                                    </span>
                                  </Show>
                                  {formatter.format(parseInt(totalProgFee()))}
                                </td>
                              </tr>
                            </Show>
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* ===== SUMMARY OF FEES ===== */}
                    <section class="border-2 border-purple-100 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 via-white to-amber-50">
                      <div class="bg-purple-900 text-amber-100 px-5 py-3">
                        <h2 class="font-bold text-lg tracking-wide">:: Summary of Fees</h2>
                      </div>
                      
                      <div class="p-6">
                        <div class="grid md:grid-cols-2 gap-6 text-sm">
                          {/* Left Column */}
                          <div class="space-y-4">
                            <div class="flex justify-between items-center pb-3 border-b border-purple-100">
                              <span class="text-gray-600">Portal Wallet (Before)</span>
                              <span class="font-mono font-bold text-purple-900">
                                {formatter.format(registrationData().openingBal())}
                              </span>
                            </div>
                            <div class="flex justify-between items-center pb-3 border-b border-purple-100">
                              <span class="text-gray-600">Seminary Charges</span>
                              <span class="font-mono font-bold text-purple-900">
                                <Show when={pickedCourses.length < 2} fallback={
                                  <Show when={registrationData().adminCharges["total"]} fallback={
                                    <Show when={getTotalAdmin()} fallback={0}>
                                      {formatter.format(getTotalAdmin())}
                                    </Show>
                                  }>
                                    {formatter.format(registrationData().adminCharges["total"][0])}
                                  </Show>
                                }>
                                  <Show when={registrationData().adminCharges["total"]} fallback={
                                    <Show when={getTotalAdmin()} fallback={0}>
                                      {formatter.format(getTotalAdmin())}
                                    </Show>
                                  }>
                                    {formatter.format(registrationData().adminCharges["total"][0])}
                                  </Show>
                                </Show>
                              </span>
                            </div>
                            <div class="flex justify-between items-center pb-3 border-b border-purple-100">
                              <span class="text-gray-600">Programme Fees</span>
                              <span class="font-mono font-bold text-purple-900">
                                {formatter.format(parseInt(totalProgFee()))}
                              </span>
                            </div>
                            <Show when={registrationData().student.affiliation_status === "yes" && period.semester==="1st"}>
                              <div class="flex justify-between items-center pb-3 border-b border-amber-200 bg-amber-50 px-3 -mx-3 rounded">
                                <span class="text-amber-800 font-medium">Affiliation Fee</span>
                                <span class="font-mono font-bold text-amber-800">
                                  {formatter.format(40000)}
                                </span>
                              </div>
                            </Show>
                          </div>
                          
                          {/* Right Column - Totals */}
                          <div class="space-y-4">
                            <div class="bg-purple-900 text-amber-100 rounded-lg p-4 text-center">
                              <span class="block text-xs uppercase tracking-wider opacity-90">Total Charges</span>
                              <span class="block text-2xl font-bold font-mono mt-1">
                                <Show when={pickedCourses.length < 2} fallback={
                                  <Show when={registrationData().adminCharges["total"]} fallback={
                                    <span>{formatter.format(
                                      parseInt(getTotalAdmin()) + parseInt(totalProgFee()) +
                                      (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                    )}</span>
                                  }>
                                    {formatter.format(
                                      parseInt(registrationData().adminCharges["total"][0]) +
                                      parseInt(totalProgFee()) +
                                      (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                    )}
                                  </Show>
                                }>
                                  <Show when={registrationData().adminCharges["total"]} fallback={
                                    <span>{formatter.format(
                                      parseInt(getTotalAdmin()) + parseInt(totalProgFee()) +
                                      (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                    )}</span>
                                  }>
                                    {formatter.format(
                                      parseInt(registrationData().adminCharges["total"][0]) +
                                      parseInt(totalProgFee()) +
                                      (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0)
                                    )}
                                  </Show>
                                </Show>
                              </span>
                            </div>
                            
                            <div class="flex justify-between items-center pb-2">
                              <span class="text-gray-600 font-medium">Portal Wallet (After)</span>
                              <span class="font-mono font-bold text-lg text-purple-900">
                                <Show when={pickedCourses.length < 2} fallback={
                                  <Show when={registrationData().adminCharges["total"]} fallback={
                                    <span>{formatter.format(
                                      parseInt(registrationData().openingBal()) -
                                      (parseInt(getTotalAdmin()) + parseInt(totalProgFee()) +
                                      (registrationData().student.affiliation_status === "yes" ? 40000 : 0))
                                    )}</span>
                                  }>
                                    {formatter.format(
                                      parseInt(registrationData().openingBal()) -
                                      (parseInt(registrationData().adminCharges["total"][0]) +
                                      parseInt(totalProgFee()) +
                                      (registrationData().student.affiliation_status === "yes" && period.semester==="1st" ? 40000 : 0))
                                    )}
                                  </Show>
                                }>
                                  <Show when={registrationData().adminCharges["total"]} fallback={
                                    <span>{formatter.format(
                                      parseInt(registrationData().openingBal()) -
                                      (parseInt(getTotalAdmin()) + parseInt(totalProgFee()) +
                                      (registrationData().student.affiliation_status === "yes" ? 40000 : 0))
                                    )}</span>
                                  }>
                                    {formatter.format(
                                      parseInt(registrationData().openingBal()) -
                                      (parseInt(registrationData().adminCharges["total"][0]) +
                                      parseInt(totalProgFee()) +
                                      (registrationData().student.affiliation_status === "yes" ? 40000 : 0))
                                    )}
                                  </Show>
                                </Show>
                              </span>
                            </div>
                          </div>
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
                                class="w-20 h-20"
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${registrationData().formNumber()}`}
                                alt="Verification QR"
                              />
                            </div>
                            <span class="block text-xs text-gray-500 mt-2 font-mono">QRETSK</span>
                            <Show when={formNumber()}>
                              <span class="block text-xs text-purple-700 font-mono mt-1">Ref: R{formNumber()}</span>
                            </Show>
                          </div>
                        </div>
                        
                        {/* Footer Note */}
                        <div class="mt-8 pt-4 border-t border-purple-100 text-center text-xs text-gray-500">
                          <p>This is an electronically generated document. No physical signature required for digital submission.</p>
                          <p class="mt-1 font-medium text-purple-700">ECWA Theological Seminary, KAGORO • Est. 1964</p>
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
            }
          >
            <Loading />
          </Show>
        </>
      </MetaProvider>
    );
}
