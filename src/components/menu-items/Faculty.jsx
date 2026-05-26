import { A } from "@solidjs/router";
import ChevronRight from "../icons/ChevronRight";

export default function Faculty() {
  return (
    <ul class="w-11/12 mx-auto mt-2 text-blue-800">
      <li class="border-b border-black py-3">
        <A
          href="/faculty/profile"
          class="flex justify-between hover:text-black"
        >
          <span>My Profile</span>
          <ChevronRight />
        </A>
      </li>
      <li class="border-b border-black py-3">
        <A
          href="/faculty/assigned-courses-period"
          class="flex justify-between hover:text-black"
        >
          <span>Assigned Courses</span>
          <ChevronRight />
        </A>
      </li>
      <li class="border-b border-black py-3">
        <A
          href="/faculty/library-resources"
          class="flex justify-between hover:text-black"
        >
          <span>Library Resources</span>
          <ChevronRight />
        </A>
      </li>
      <li class="border-b border-black py-3">
        <A
          href="/faculty/change-password"
          class="flex justify-between hover:text-black"
        >
          <span>Change Password</span>
          <ChevronRight />
        </A>
      </li>
    </ul>
  );
}
