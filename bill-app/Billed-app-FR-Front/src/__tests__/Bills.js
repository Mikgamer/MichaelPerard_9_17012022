/**
 * @jest-environment jsdom
 */

import { prettyDOM, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
// Simulate localStorage
import { localStorageMock } from "../__mocks__/localStorage.js";
// Get generic path (if path modified, test will still work)
import { ROUTES_PATH } from "../constants/routes.js"
// Generate page
import Router from "../app/Router.js";

// Setup localstorage and window with its location hash
Object.defineProperty(window, "localStorage", {value: localStorageMock});
Object.defineProperty(window, "location", { value: { hash: "" } });

describe("Given I am connected as an employee", () => {
  // Set localstorage user type to employee
  window.localStorage.setItem( "user", JSON.stringify({type: "Employee"}) );

  describe("When I am on Bills Page", () => { 
    // Set location to Bills Page
    window.location.hash = ROUTES_PATH["Bills"]

    test("Then bill icon in vertical layout should be highlighted", () => {
      // Set root for the router function to work 
      const root = "<div id='root'></div>"
      document.body.innerHTML = root
      // Set Bills Page thanks to the window location hash
      Router()

      const isBillIconActive = screen.getByTestId("icon-window").classList.contains("active-icon")
      expect(isBillIconActive).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^[0-3]\d .+\. \d\d$/i).map(a => a.dataset.date)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = dates.sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
