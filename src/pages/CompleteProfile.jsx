import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";

import Header from "../components/Header";
import TextInput from "../components/TextInput";
import { Select } from "../components/Select";
import { Show, createSignal, createEffect, Switch, Match } from "solid-js";
import Success from "../components/icons/Success";
import Loading from "../components/Loading";

const schema = z.object({
  // ledger_number: z.string().min(7, "*Invalid").toUpperCase(),
  date_of_birth: z.string().min(1, "*Required"),
  state_of_origin: z.string().min(1, "*Required"),
  country_of_origin: z.string().min(1, "*Required"),
  denomination: z.string().min(1, "*Required"),
  local_church: z.string().min(1, "*Required"),
  name_of_pastor: z.string().min(1, "*Required"),
  work_fulltime: z.string().min(1, "*Required"),
  ministry: z.string().min(1, "*Required"),
  year_of_admission: z.string().min(1, "*Required"),
  programme_category: z.string().min(1, "*Required"),
  department: z.string().min(1, "*Required"),
  faculty: z.string().min(1, "*Required"),
  programme: z.string().min(1, "*Required"),
  affiliation_status: z.string().min(1, "*Required"),
  special_student_category: z.string().optional(),
});

export default function CompleteProfile() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [studentId, setStudentId] = createSignal("");
  const [studentEmail, setStudentEmail] = createSignal("");
  const [matriculationNumber, setMatriculationNumber] = createSignal("");
  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  // const doSetMatriculationNumber = async (programme, year) => {
  //   var yrr = year.toString();
  //   let yr = yrr.substring(2, 4);

  //   if (programme === "Bachelor of Arts in Theology (Theological Studies)") {
  //     setMatriculationNumber("ETSK/UG" + yr + "/TS/" + studentId());
  //   }
  //   if (programme === "Bachelor of Arts in Theology (Pastoral Studies)") {
  //     setMatriculationNumber("ETSK/UG" + yr + "/PS/" + studentId());
  //   }
  //   if (programme === "Bachelor of Arts in Theology (Christian Education)") {
  //     setMatriculationNumber("ETSK/UG" + yr + "/CE/" + studentId());
  //   }
  //   if (programme === "Bachelor of Arts in Theology (Evangelism & Missions)") {
  //     setMatriculationNumber("ETSK/UG" + yr + "/EM/" + studentId());
  //   }
  //   if (programme === "Bachelor of Arts in Theology (Biblical Studies)") {
  //     setMatriculationNumber("ETSK/UG" + yr + "/BS/" + studentId());
  //   }
  //   if (programme === "Bachelor of Arts in Theology (Youth Ministry)") {
  //     setMatriculationNumber("ETSK/UG" + yr + "/YM/" + studentId());
  //   }
  //   if (programme === "Bachelor of Arts in Theology (Linguistics)") {
  //     setMatriculationNumber("ETSK/UG" + yr + "/LI/" + studentId());
  //   }
  //   if (programme === "Post-Graduate Diploma of Theology") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/PGDT/" + studentId());
  //   }
  //   if (programme === "Master of Divinity (Pastoral Studies)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/MD/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Biblical Studies - Old Testament)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/OT/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Biblical Studies - New Testament)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/NT/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Systematic Theology)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/ST/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Theological Studies)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/TS/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Church History & Historical Theology)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/CH/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Christian Ethics & Public Theology)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/CP/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Christian Apologetics)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/CA/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Pastoral Studies)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/PA/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Christian Education)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/CE/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Mission & Intercultural Studies)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/MI/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Leadership & Administration)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/LA/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Biblical Counseling & Psychology)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/BP/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Peace & Conflict Studies)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/PC/" + studentId());
  //   }
  //   if (programme === "Master of Arts (Youth Ministry)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/YM/" + studentId());
  //   }
  //   if (programme === "Master of Arts in Theology (Linguistics)") {
  //     setMatriculationNumber("ETSK/PG" + yr + "/LI/" + studentId());
  //   }
  // };

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    // await doSetMatriculationNumber(
    //   formData().programme,
    //   formData().year_of_admission
    // );

    setMatriculationNumber(studentId());

    const request1 = fetch(VITE_API_URL + "/api/create-student", {
      mode: "cors",
      headers: {
        Authorization: `Bearer ${
          JSON.parse(localStorage.getItem("jetsUser")).token
        }`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        custom_id: JSON.parse(localStorage.getItem("jetsUser")).custom_id,
        // ledger_number: formData().ledger_number.toUpperCase(),
        date_of_birth: formData().date_of_birth,
        email: studentEmail().toLowerCase().replace(/\s/g, ""),
        matriculation_number: matriculationNumber(),
        state_of_origin: formData().state_of_origin,
        country_of_origin: formData().country_of_origin,
        denomination: formData().denomination,
        local_church: formData().local_church,
        name_of_pastor: formData().name_of_pastor,
        work_fulltime: formData().work_fulltime,
        ministry: formData().ministry,
        year_of_admission: formData().year_of_admission,
        programme_category: formData().programme_category,
        programme: formData().programme,
        department: formData().department,
        faculty: formData().faculty,
        affiliation_status: formData().affiliation_status,
        special_student_category: formData().special_student_category,
      }),
    }).then((response) => response.json());
    const request2 = fetch(
      VITE_API_URL +
        "/api/edit-user/" +
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
        method: "PATCH",
        body: JSON.stringify({
          status: "upload passport",
        }),
      }
    ).then((response) => response.json());
    const request3 = fetch(VITE_API_URL + "/api/create-portal-wallet", {
      mode: "cors",
      headers: {
        Authorization: `Bearer ${
          JSON.parse(localStorage.getItem("jetsUser")).token
        }`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        amount: "00",
        custom_id: JSON.parse(localStorage.getItem("jetsUser")).custom_id,
        tx_ref_ids: "initial_ref",
      }),
    }).then((response) => response.json());
    const request4 = fetch(VITE_API_URL + "/api/create-accommodation-wallet", {
      mode: "cors",
      headers: {
        Authorization: `Bearer ${
          JSON.parse(localStorage.getItem("jetsUser")).token
        }`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        amount: "00",
        custom_id: JSON.parse(localStorage.getItem("jetsUser")).custom_id,
      }),
    }).then((response) => response.json());
    Promise.all([request1, request2, request3, request4])
      .then(([data1, data2, data3, data4]) => {
        if (data1.success && data2.success && data3.success && data4.success) {
          setIsProcessing(false);
          setShowSuccess(true);
        } else {
          setIsProcessing(false);
          const errorMessage = data1.response || data2.response ||
                                data3.response || data4.response ||
                                  "An error occurred! Contact ICT Dept."
          setMessage( errorMessage );
        }
      })
      .catch((error) => {
        console.error('API Error: ', error);
        setIsProcessing(false);
        setMessage(error.message || 'Network Error');
      });
  };

  createEffect(async () => {
    const navigate = useNavigate();
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
        if (result.response.status !== "complete profile") {
          navigate("/student/downloads", { replace: true });
        } else {
          if (result.response.mode_of_study === "virtual"){
            setStudentEmail(
            result.response.first_name +
              "." +
              result.response.username +
              "@online.jets.edu.ng"
            );            
          }else{
            setStudentEmail(
            result.response.first_name +
              "." +
              result.response.username +
              "@jets.edu.ng"
            );            
          }          
          setStudentId(result.response.username);
          setLoading(false);
        }
      }
    } else {
      navigate("/", { replace: true });
    }
  });

  return (
    <MetaProvider>
      <Title>Complete Profile - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Complete your online profile on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showSuccess()}>
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Profile Completed
              </h2>
              <div class="my-2 border-t border-b py-4 border-black">
                <Success />
                <p>
                  You have successfully updated your profile. Click the OK to
                  continue.
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() => (window.location.href = "/student/downloads")}
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Ok. Continue
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Header />
        <Show when={!loading()} fallback={<Loading />}>
          <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Complete Profile
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>
                Ensure to fill all required fields correctly. Please
                double-check your entries before you submit.
              </p>
            </div>
            <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4">
              <form autocomplete="off" onSubmit={submit} class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                  {/* <div>
                    <TextInput
                      label="Ledger Number:"
                      name="ledger_number"
                      required={true}
                      formHandler={formHandler}
                    />
                  </div> */}
                  <div>
                    <TextInput
                      label="Date of Birth:"
                      name="date_of_birth"
                      required={true}
                      formHandler={formHandler}
                      type="date"
                    />
                  </div>
                  <div>
                    <TextInput
                      label="State of Origin:"
                      name="state_of_origin"
                      placeholder="State or Region"
                      required={true}
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <Select
                      label="Country of Origin:"
                      name="country_of_origin"
                      placeholder="Select"
                      required={true}
                      options={[
                                { value: "Afghanistan", label: "Afghanistan" },{ value: "Albania", label: "Albania" },{ value: "Algeria", label: "Algeria" },{ value: "Andorra", label: "Andorra" },
                                { value: "Angola", label: "Angola" },{ value: "Antigua and Barbuda", label: "Antigua and Barbuda" },{ value: "Argentina", label: "Argentina" },{ value: "Armenia", label: "Armenia" },
                                { value: "Australia", label: "Australia" },{ value: "Austria", label: "Austria" },{ value: "Azerbaijan", label: "Azerbaijan" },{ value: "Bahamas", label: "Bahamas" },{ value: "Bahrain", label: "Bahrain" },
                                { value: "Bangladesh", label: "Bangladesh" },{ value: "Barbados", label: "Barbados" },{ value: "Belarus", label: "Belarus" },{ value: "Belgium", label: "Belgium" },{ value: "Belize", label: "Belize" },
                                { value: "Benin", label: "Benin" },{ value: "Bhutan", label: "Bhutan" },{ value: "Bolivia", label: "Bolivia" },{ value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },{ value: "Botswana", label: "Botswana" },
                                { value: "Brazil", label: "Brazil" },{ value: "Brunei", label: "Brunei" },{ value: "Bulgaria", label: "Bulgaria" },{ value: "Burkina Faso", label: "Burkina Faso" },{ value: "Burundi", label: "Burundi" },
                                { value: "Cabo Verde", label: "Cabo Verde" },{ value: "Cambodia", label: "Cambodia" },{ value: "Cameroon", label: "Cameroon" },{ value: "Canada", label: "Canada" },{ value: "Central African Republic", label: "Central African Republic" },
                                { value: "Chad", label: "Chad" },{ value: "Chile", label: "Chile" },{ value: "China", label: "China" },{ value: "Colombia", label: "Colombia" },{ value: "Comoros", label: "Comoros" },{ value: "Congo (Congo-Brazzaville)", label: "Congo (Congo-Brazzaville)" },
                                { value: "Costa Rica", label: "Costa Rica" },{ value: "Croatia", label: "Croatia" },{ value: "Cuba", label: "Cuba" },{ value: "Cyprus", label: "Cyprus" },{ value: "Czechia (Czech Republic)", label: "Czechia (Czech Republic)" },
                                { value: "Democratic Republic of the Congo", label: "Democratic Republic of the Congo" },{ value: "Denmark", label: "Denmark" },{ value: "Djibouti", label: "Djibouti" },{ value: "Dominica", label: "Dominica" },{ value: "Dominican Republic", label: "Dominican Republic" },
                                { value: "Ecuador", label: "Ecuador" },{ value: "Egypt", label: "Egypt" },{ value: "El Salvador", label: "El Salvador" },{ value: "Equatorial Guinea", label: "Equatorial Guinea" },{ value: "Eritrea", label: "Eritrea" },
                                { value: "Estonia", label: "Estonia" },{ value: "Eswatini (fmr. Swaziland)", label: "Eswatini (fmr. Swaziland)" },{ value: "Ethiopia", label: "Ethiopia" },{ value: "Fiji", label: "Fiji" },{ value: "Finland", label: "Finland" },
                                { value: "France", label: "France" },{ value: "Gabon", label: "Gabon" },{ value: "Gambia", label: "Gambia" },{ value: "Georgia", label: "Georgia" },{ value: "Germany", label: "Germany" },{ value: "Ghana", label: "Ghana" },
                                { value: "Greece", label: "Greece" },{ value: "Grenada", label: "Grenada" },{ value: "Guatemala", label: "Guatemala" },{ value: "Guinea", label: "Guinea" },{ value: "Guinea-Bissau", label: "Guinea-Bissau" },{ value: "Guyana", label: "Guyana" },
                                { value: "Haiti", label: "Haiti" },{ value: "Honduras", label: "Honduras" },{ value: "Hungary", label: "Hungary" },{ value: "Iceland", label: "Iceland" }, { value: "India", label: "India" },{ value: "Indonesia", label: "Indonesia" },
                                { value: "Iran", label: "Iran" },{ value: "Iraq", label: "Iraq" },{ value: "Ireland", label: "Ireland" },{ value: "Israel", label: "Israel" },{ value: "Italy", label: "Italy" },{ value: "Jamaica", label: "Jamaica" },
                                { value: "Japan", label: "Japan" },{ value: "Jordan", label: "Jordan" },{ value: "Kazakhstan", label: "Kazakhstan" },{ value: "Kenya", label: "Kenya" },{ value: "Kiribati", label: "Kiribati" },{ value: "Korea, North", label: "Korea, North" },
                                { value: "Korea, South", label: "Korea, South" },{ value: "Kosovo", label: "Kosovo" },{ value: "Kuwait", label: "Kuwait" },{ value: "Kyrgyzstan", label: "Kyrgyzstan" },{ value: "Laos", label: "Laos" },
                                { value: "Latvia", label: "Latvia" },{ value: "Lebanon", label: "Lebanon" },{ value: "Lesotho", label: "Lesotho" },{ value: "Liberia", label: "Liberia" },{ value: "Libya", label: "Libya" },{ value: "Liechtenstein", label: "Liechtenstein" },
                                { value: "Lithuania", label: "Lithuania" },{ value: "Luxembourg", label: "Luxembourg" },{ value: "Madagascar", label: "Madagascar" },{ value: "Malawi", label: "Malawi" },{ value: "Malaysia", label: "Malaysia" },
                                { value: "Maldives", label: "Maldives" },{ value: "Mali", label: "Mali" },{ value: "Malta", label: "Malta" },{ value: "Marshall Islands", label: "Marshall Islands" },{ value: "Mauritania", label: "Mauritania" },
                                { value: "Mauritius", label: "Mauritius" },{ value: "Mexico", label: "Mexico" },{ value: "Micronesia", label: "Micronesia" },{ value: "Moldova", label: "Moldova" },{ value: "Monaco", label: "Monaco" },
                                { value: "Mongolia", label: "Mongolia" },{ value: "Montenegro", label: "Montenegro" },{ value: "Morocco", label: "Morocco" },{ value: "Mozambique", label: "Mozambique" },{ value: "Myanmar (Burma)", label: "Myanmar (Burma)" },
                                { value: "Namibia", label: "Namibia" },{ value: "Nauru", label: "Nauru" },{ value: "Nepal", label: "Nepal" },{ value: "Netherlands", label: "Netherlands" },{ value: "New Zealand", label: "New Zealand" },{ value: "Nicaragua", label: "Nicaragua" },
                                { value: "Niger", label: "Niger" },{ value: "Nigeria", label: "Nigeria" },{ value: "North Macedonia", label: "North Macedonia" },{ value: "Norway", label: "Norway" },{ value: "Oman", label: "Oman" },{ value: "Pakistan", label: "Pakistan" },
                                { value: "Palau", label: "Palau" },{ value: "Palestine", label: "Palestine" },{ value: "Panama", label: "Panama" },{ value: "Papua New Guinea", label: "Papua New Guinea" },{ value: "Paraguay", label: "Paraguay" },{ value: "Peru", label: "Peru" },
                                { value: "Philippines", label: "Philippines" },{ value: "Poland", label: "Poland" },{ value: "Portugal", label: "Portugal" },{ value: "Qatar", label: "Qatar" },{ value: "Romania", label: "Romania" },{ value: "Russia", label: "Russia" },
                                { value: "Rwanda", label: "Rwanda" },{ value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },{ value: "Saint Lucia", label: "Saint Lucia" },{ value: "Saint Vincent and the Grenadines", label: "Saint Vincent and the Grenadines" },
                                { value: "Samoa", label: "Samoa" },{ value: "San Marino", label: "San Marino" },{ value: "Sao Tome and Principe", label: "Sao Tome and Principe" },{ value: "Saudi Arabia", label: "Saudi Arabia" },{ value: "Senegal", label: "Senegal" },
                                { value: "Serbia", label: "Serbia" },{ value: "Seychelles", label: "Seychelles" },{ value: "Sierra Leone", label: "Sierra Leone" },{ value: "Singapore", label: "Singapore" },{ value: "Slovakia", label: "Slovakia" },{ value: "Slovenia", label: "Slovenia" },
                                { value: "Solomon Islands", label: "Solomon Islands" },{ value: "Somalia", label: "Somalia" },{ value: "South Africa", label: "South Africa" },{ value: "South Sudan", label: "South Sudan" },{ value: "Spain", label: "Spain" },{ value: "Sri Lanka", label: "Sri Lanka" },
                                { value: "Sudan", label: "Sudan" },{ value: "Suriname", label: "Suriname" },{ value: "Sweden", label: "Sweden" },{ value: "Switzerland", label: "Switzerland" },{ value: "Syria", label: "Syria" },{ value: "Taiwan", label: "Taiwan" },{ value: "Tajikistan", label: "Tajikistan" },
                                { value: "Tanzania", label: "Tanzania" },{ value: "Thailand", label: "Thailand" },{ value: "Timor-Leste", label: "Timor-Leste" },{ value: "Togo", label: "Togo" },{ value: "Tonga", label: "Tonga" },{ value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
                                { value: "Tunisia", label: "Tunisia" },{ value: "Turkey", label: "Turkey" },{ value: "Turkmenistan", label: "Turkmenistan" },{ value: "Tuvalu", label: "Tuvalu" },{ value: "Uganda", label: "Uganda" },{ value: "Ukraine", label: "Ukraine" },
                                { value: "United Arab Emirates", label: "United Arab Emirates" },{ value: "United Kingdom", label: "United Kingdom" },{ value: "United States", label: "United States" },{ value: "Uruguay", label: "Uruguay" },{ value: "Uzbekistan", label: "Uzbekistan" },
                                { value: "Vanuatu", label: "Vanuatu" },{ value: "Vatican City", label: "Vatican City" },{ value: "Venezuela", label: "Venezuela" },{ value: "Vietnam", label: "Vietnam" },{ value: "Yemen", label: "Yemen" },{ value: "Zambia", label: "Zambia" },
                                { value: "Zimbabwe", label: "Zimbabwe" }
                              ]}
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <Select
                      label="Denomination:"
                      name="denomination"
                      placeholder="Select"
                      required={true}
                      options={[
                        { value: "ECWA", label: "ECWA" },
                        { value: "Non-ECWA", label: "Non-ECWA" },
                      ]}
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <TextInput
                      label="Local Church:"
                      name="local_church"
                      required={true}
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <TextInput
                      label="Name of Pastor:"
                      name="name_of_pastor"
                      required={true}
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <Select
                      label="Work fulltime?"
                      name="work_fulltime"
                      placeholder="Select"
                      required={true}
                      options={[
                        { value: "No", label: "No" },
                        { value: "Yes", label: "Yes" },
                      ]}
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <TextInput
                      label="Type of Ministry:"
                      name="ministry"
                      required={true}
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <Select
                      label="Year of Admission:"
                      name="year_of_admission"
                      placeholder="Select"
                      required={true}
                      options={[
                        { value: "2015", label: "2015" },
                        { value: "2016", label: "2016" },
                        { value: "2017", label: "2017" },
                        { value: "2018", label: "2018" },
                        { value: "2019", label: "2019" },
                        { value: "2020", label: "2020" },
                        { value: "2021", label: "2021" },
                        { value: "2022", label: "2022" },
                        { value: "2023", label: "2023" },
                        { value: "2024", label: "2024" },
                        { value: "2025", label: "2025" },
                        { value: "2026", label: "2026" },
                        { value: "2027", label: "2027" },
                        { value: "2028", label: "2028" },
                        { value: "2029", label: "2029" },
                        { value: "2030", label: "2030" },
                        { value: "2031", label: "2031" },
                      ]}
                      formHandler={formHandler}
                    />
                  </div>

                  <div>
                    <Select
                      label="Faculty:"
                      name="faculty"
                      placeholder="Select"
                      required={true}
                      options={[                       
                        {
                          value: "Faculty of Theological Studies",
                          label: "Faculty of Theological Studies",
                        },
                        {
                          value: "Faculty of Practical Theology",
                          label: "Faculty of Practical Theology",
                        }
                      ]}
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <Switch>
                      <Match when={formData().faculty === ""}>
                        <Select
                          label="Department:"
                          name="department"
                          placeholder="Select"
                          required={true}
                          options={[]}
                          formHandler={formHandler}
                        />
                      </Match>
                      <Match
                        when={
                          formData().faculty === "Faculty of Biblical Studies"
                        }
                      >
                        <Select
                          label="Department:"
                          name="department"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "Old Testament",
                              label: "Department of Old Testament",
                            },
                            {
                              value: "New Testament",
                              label: "Department of New Testament",
                            },
                            {
                              value: "Linguistics",
                              label: "Department of Linguistics"
                            }
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                      <Match
                        when={
                          formData().faculty ===
                          "Faculty of Theological Studies"
                        }
                      >
                        <Select
                          label="Department:"
                          name="department"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "Systematic Theology",
                              label: "Department of Systematic Theology",
                            },
                            {
                              value: "Church Histroy",
                              label:
                                "Department of Church History",
                            },
                            {
                              value: "Christian Theology of Public Policy",
                              label:
                                "Department of Christian Theology of Public Policy",
                            },
                            {
                              value: "Biblical Studies",
                              label: "Department of Biblical Studies",
                            }
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                      <Match
                        when={
                          formData().faculty === "Faculty of Practical Theology"
                        }
                      >
                        <Select
                          label="Department:"
                          name="department"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "Pastoral Studies",
                              label: "Department of Pastoral Studies",
                            },
                            {
                              value: "Intercultural Studies",
                              label:
                                "Department of Intercultural Studies",
                            },
                            {
                              value: "Expository Preaching",
                              label: "Department of Expository Preaching",
                            },
                            {
                              value: "Psychology & Christian Counselling",
                              label:
                                "Department of Psychology & Christian Counselling",
                            },
                            {
                              value: "Peace and Conflict Studies",
                              label: "Department of Peace and Conflict Studies",
                            },
                            {
                              value: "Christian Education",
                              label: "Department of Christian Education",
                            }
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                      <Match
                        when={formData().faculty === "Faculty of Education"}
                      >
                        <Select
                          label="Department:"
                          name="department"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "Christian Education",
                              label: "Department of Christian Education",
                            },
                            {
                              value: "Biblical Counselling and Psychology",
                              label:
                                "Department of Biblical Counselling and Psychology",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                    </Switch>
                  </div>
                  <div>
                    <Select
                      label="Programme Category:"
                      name="programme_category"
                      placeholder="Select"
                      required={true}
                      options={[
                        {
                          value: "Basic English",
                          label: "Basic English",
                        },
                        {
                          value: "Certificate Programme",
                          label: "Certificate Programme",
                        },
                        {
                          value: "Diploma Programme",
                          label: "Diploma Programme",
                        },
                        {
                          value: "Masters Programme",
                          label: "Masters Programme",
                        },
                        {
                          value: "Master of Divinity Programme",
                          label: "Master of Divinity Programme",
                        },
                        { 
                          value: "PGDT Programme",
                          label: "PGDT Programme" 
                        },
                        {
                          value: "Bachelor of Arts Programme",
                          label: "Bachelor of Arts Programme",
                        },
                      ]}
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <Switch>
                      <Match
                        when={
                          formData().programme_category === "Basic English"
                        }
                      >
                        <Select
                          label="Programme of Study:"
                          name="programme"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "Basic English",
                              label: "Basic English",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                      <Match
                        when={
                          formData().programme_category === "Certificate Programme"
                        }
                      >
                        <Select
                          label="Programme of Study:"
                          name="programme"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "Certificate Programme",
                              label: "Certificate Programme",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                                            <Match
                        when={
                          formData().programme_category === "Diploma Programme"
                        }
                      >
                        <Select
                          label="Programme of Study:"
                          name="programme"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "Diploma Programme",
                              label: "Diploma Programme",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                      <Match
                        when={
                          formData().programme_category ===
                          "Bachelor of Arts Programme"
                        }
                      >
                        <Select
                          label="Programme of Study:"
                          name="programme"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value:
                                "Bachelor of Arts in Theology (Intercultural Studies)",
                              label:
                                "Bachelor of Arts in Theology (Intercultural Studies)",
                            },
                            {
                              value:
                                "Bachelor of Arts in Theology (Pastoral Studies)",
                              label:
                                "Bachelor of Arts in Theology (Pastoral Studies)",
                            },
                            {
                              value:
                                "Bachelor of Arts in Theology (Expository Preaching)",
                              label:
                                "Bachelor of Arts in Theology (Expository Preaching)",
                            },
                            {
                              value:
                                "Bachelor of Arts in Theology (Psychology and Christian Counseling",
                              label:
                                "Bachelor of Arts in Theology (Psychology and Christian Counseling)",
                            },
                            {
                              value:
                                "Bachelor of Arts in Theology (Biblical Studies)",
                              label:
                                "Bachelor of Arts in Theology (Biblical Studies)",
                            },
                            {
                              value: "Bachelor of Arts in Theology (Christian Education of Public Policy)",
                              label: "Bachelor of Arts in Theology (Christian Education of Public Policy)",
                            },
                            {
                              value: "Bachelor of Arts in Theology (Christian Education)",
                              label: "Bachelor of Arts in Theology (Christian Education)",
                            },
                            {
                              value: "Bachelor of Arts in Theology (Systemic Theology)",
                              label: "Bachelor of Arts in Theology (Systemic Theology)",
                            },
                            {
                              value: "Bachelor of Arts in Theology (Church History)",
                              label: "Bachelor of Arts in Theology (Church History)",
                            }
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                      <Match
                        when={
                          formData().programme_category === "PGDT Programme"
                        }
                      >
                        <Select
                          label="Programme of Study:"
                          name="programme"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "Post-Graduate Diploma of Theology",
                              label: "Post-Graduate Diploma of Theology",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                      <Match
                        when={
                          formData().programme_category ===
                          "Master of Divinity Programme"
                        }
                      >
                        <Select
                          label="Programme of Study:"
                          name="programme"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "Master of Divinity (Pastoral Studies)",
                              label: "Master of Divinity (Pastoral Studies)",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                      <Match
                        when={
                          formData().programme_category === "Masters Programme"
                        }
                      >
                        <Select
                          label="Programme of Study:"
                          name="programme"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value:
                                "Master of Arts in Theology (Intercultural Studies)",
                              label:
                                "Master of Arts in Theology (Intercultural Studies)",
                            },
                            {
                              value:
                                "Master of Arts in Theology (Pastoral Studies)",
                              label:
                                "Master of Arts in Theology (Pastoral Studies)",
                            },
                            {
                              value:
                                "Master of Arts in Theology (Expository Preaching)",
                              label:
                                "Master of Arts in Theology (Expository Preaching)",
                            },
                            {
                              value:
                                "Master of Arts in Theology (Psychology and Christian Counseling",
                              label:
                                "Master of Arts in Theology (Psychology and Christian Counseling)",
                            },
                            {
                              value:
                                "Master of Arts in Theology (Biblical Studies)",
                              label:
                                "Master of Arts in Theology (Biblical Studies)",
                            },
                            {
                              value: "Master of Arts in Theology (Christian Education of Public Policy)",
                              label: "Master of Arts in Theology (Christian Education of Public Policy)",
                            },
                            {
                              value: "Master of Arts in Theology (Christian Education)",
                              label: "Master of Arts in Theology (Christian Education)",
                            },
                            {
                              value: "Master of Arts in Theology (Systemic Theology)",
                              label: "Master of Arts in Theology (Systemic Theology)",
                            },
                            {
                              value: "Master of Arts in Theology (Church History)",
                              label: "Master of Arts in Theology (Church History)",
                            }
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>

                      <Match when={formData().programme_category === ""}>
                        <Select
                          label="Programme of Study:"
                          name="programme"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "",
                              label: "",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </Match>
                    </Switch>
                  </div>
                  <div>
                    <Show
                      when={
                        formData().programme_category ===
                        "Bachelor of Arts Programme"
                      }
                      fallback={
                        <Select
                          label="Are you an Affiliation Student?"
                          name="affiliation_status"
                          placeholder="Select"
                          required={true}
                          options={[{ value: "no", label: "No" }]}
                          formHandler={formHandler}
                        />
                      }
                    >
                      <Select
                        label="Are you an Affiliation Student?"
                        name="affiliation_status"
                        placeholder="Select"
                        required={true}
                        options={[
                          { value: "no", label: "No" },
                          { value: "yes", label: "Yes" },                          
                        ]}
                        formHandler={formHandler}
                      />
                    </Show>
                  </div>
                  <div>
                    <Select
                      label="Int'l Student?:"
                      name="special_student_category"
                      required={false}
                      options={[
                          { value: "no", label: "No" },
                          { value: "yes", label: "Yes" },                          
                        ]}
                      formHandler={formHandler}
                    />
                  </div>
                </div>

                <Show when={message() !== ""}>
                  <div class="bg-purple-200 text-purple-900 p-3 text-center animate-pulse border-l-2 border-black">
                    {message()}
                  </div>
                </Show>

                <div class="sm:flex">
                  <div class="hidden sm:block sm:grow">&nbsp;</div>
                  <div class="w-full sm:w-60">
                    <Show
                      when={formHandler.isFormInvalid()}
                      fallback={
                        <>
                          <Show
                            when={isProcessing()}
                            fallback={
                              <button
                                type="submit"
                                class="red-btn w-full p-3 text-center hover:opacity-60"
                              >
                                Proceed
                              </button>
                            }
                          >
                            <button
                              disabled
                              class="gray2-btn cursor-wait w-full p-3 text-center hover:opacity-60"
                            >
                              Processing.. .
                            </button>
                          </Show>
                        </>
                      }
                    >
                      <button
                        disabled
                        class="gray-btn w-full p-3 text-center cursor-not-allowed"
                      >
                        Proceed
                      </button>
                    </Show>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Show>
      </div>
    </MetaProvider>
  );
}
