/**
 * @jest-environment jsdom
 */

import { prettyDOM, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import Router from "../app/Router.js"

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
    test("Then all open bill icons should display modal when you click on it", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const currentBills = new Bills ({ document, onNavigate, store: store, localStorage: localStorage })

      $.fn.modal = jest.fn();
      const spyModal = jest.spyOn($.fn, "modal")


      const eyeIcons = screen.getAllByTestId("icon-eye")
      eyeIcons.map(eyeIcon => { userEvent.click(eyeIcon) })
      expect(spyModal).toHaveBeenCalledTimes(4)
    })
    test("Then adding a new bill should load newbills page", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      const currentBills = new Bills({ document, onNavigate, store: store, localStorage: localStorage })

      const handleClickNewBill = jest.fn((e) => currentBills.handleClickNewBill(e))
      const newBills = screen.getByTestId("btn-new-bill")
      newBills.addEventListener('click', handleClickNewBill)
      userEvent.click(newBills)

      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as an employee", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(store, "get")
       const bills = await store.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})