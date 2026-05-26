import { A } from "@solidjs/router";
import ChevronRight from "../icons/ChevronRight";

export default function NotLoggedIn() {
  return (
    <ul class="w-11/12 mx-auto mt-2 text-blue-800">
      <li class="border-b border-black py-3">
        <A href="/student/login" class="flex justify-between hover:text-black">
          <span>Student Access</span>
          <ChevronRight />
        </A>
      </li>
      <li class="border-b border-black py-3">
        <A
          href="/student/create-profile"
          class="flex justify-between hover:text-black"
        >
          <span>Create Student Profile</span>
          <ChevronRight />
        </A>
      </li>
      <li class="border-b border-black py-3">
        <A href="/faculty/login" class="flex justify-between hover:text-black">
          <span>Faculty Access</span>
          <ChevronRight />
        </A>
      </li>
      <li class="border-b border-black py-3">
        <A href="/admin/login" class="flex justify-between hover:text-black">
          <span>Admin Access</span>
          <ChevronRight />
        </A>
      </li>
    </ul>
  );
}
