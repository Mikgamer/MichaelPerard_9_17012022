/**
 * @jest-environment jsdom
 */

import { screen, within, waitFor, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { ApiEntity } from "../app/Store.js"
import { bills } from "../fixtures/bills.js"

// Setup localstorage and window with its location hash
Object.defineProperty(window, "localStorage", {value: localStorageMock});
Object.defineProperty(window, "location", { value: { hash: "" } });

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then adding a file to the form should call the api", async() => {
      window.localStorage.setItem( "user", JSON.stringify({type: "Employee"}) );
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      class FakeApiEntity { async update({data, headers = {}}) { return await "" } async create({data, headers = {}}) { return await "" } }
      const fakeStore = { bills : () => new FakeApiEntity()}
      const currenNewBill = new NewBill({ document, onNavigate, store: fakeStore, localStorage: localStorage })
      const fileTest = new File(['hello'], 'path\\hello.png', {type: 'image/png'})

      const handleChangeFile = jest.fn((e) => currenNewBill.handleChangeFile(e))

      const selectFile = screen.getByTestId("file")
      selectFile.addEventListener('change', handleChangeFile)
      userEvent.upload(selectFile, fileTest)

      expect(selectFile.files[0]).toStrictEqual(fileTest)
      expect(selectFile.files.item(0)).toStrictEqual(fileTest)
      expect(selectFile.files).toHaveLength(1)
    })
    test("Then sending my new bill, I should be to the bill page", async() => {
      window.localStorage.setItem( "user", JSON.stringify({type: "Employee"}) );
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      const currenNewBill = new NewBill({ document, onNavigate, store: null, localStorage: localStorage })

      const handleSubmit = jest.fn((e) => currenNewBill.handleSubmit(e))

      const form = screen.getByTestId("form-new-bill")
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      const isBills = screen.getByText(/Mes notes de frais/)
      expect(isBills).toBeTruthy()
    })
  })
})
