import { A } from "@solidjs/router";
import Success from "../components/icons/Success";
import ChevronRight from "../components/icons/ChevronRight";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import Header from "../components/Header";

export default function CreatedStudentProfile() {
  return (
    <MetaProvider>
      <Title>
        Student Profile Created for ECWA Theological Seminary, Kagoro (ETSK)
      </Title>
      <Meta
        name="description"
        content="Student profile created for ECWA Theological Seminary, Kagoro (ETSK)"
      />
      <div class="sm:grid sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div class="hidden sm:block bg lg:col-span-2 bg-blue-900">&nbsp;</div>
        <div class="sm:h-screen">
          <Header />
          <div class="mt-8 mb-20 sm:mb-0 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Student Profile Created
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>Please copy the default password below & go to 'Login'.</p>
            </div>
            <div class="pt-4 space-y-2">
              <div>
                <Success />
              </div>
              <p>
                Your online profile was created successfully. Use your
                Student ID and the default password below to Log in:
              </p>
              <p class="text-center">
                <b>Default Password:</b>
                <br />
                <u>1234abcd</u>
              </p>
              <div>
                <A
                  href="/student/login"
                  class="blue-btn hover:opacity-60 flex justify-between p-4"
                >
                  <span>Student Access</span>
                  <ChevronRight />
                </A>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
