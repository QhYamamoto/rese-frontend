import { NuxtAxiosInstance } from "@nuxtjs/axios";
import axios from "axios";
import courseRepository from "~/repository/course/courseRepository";
import courseRepositoryInterface from "~/repository/course/courseRepositoryInterface";
import reservationRepository from "~/repository/reservation/reservationRepository";
import reservationRepositoryInterface from "~/repository/reservation/reservationRepositoryInterface";
import shopRepository from "~/repository/shop/shopRepository";
import shopRepositoryInterface from "~/repository/shop/shopRepositoryInterface";
import adminShopService from "~/service/adminShop/adminShopService";
import { newCourse, newShop } from "~/types/api";
import { courseRequest, shopRequest } from "~/types/axiosRequest";
import { COURSE, HISTORY, RESERVATION, SHOP, SHOP_RESPONSE, SHOP_RESPONSE_WITH_RESERVATIONS } from "../consts";

/* shopRepositoryのインスタンスを作成、必要なメソッドをモック化 */
const shopRepositoryInstance: shopRepositoryInterface = new shopRepository(axios as NuxtAxiosInstance);
const mockGetShopById = jest.spyOn(shopRepositoryInstance, 'getById')
  .mockImplementation((representativeId: number) => Promise.resolve(SHOP_RESPONSE));
const mockGetShopByIdAsRepresentative = jest.spyOn(shopRepositoryInstance, 'getByIdAsRepresentative')
  .mockImplementation((representativeId: number) => Promise.resolve(SHOP_RESPONSE_WITH_RESERVATIONS));
const mockUpdateShop = jest.spyOn(shopRepositoryInstance, 'update')
  .mockImplementation((shopId: number, sendData: shopRequest) => Promise.resolve());

/* reservationRepositoryのインスタンスを作成、必要なメソッドをモック化 */
const reservationRepositoryInstance: reservationRepositoryInterface = new reservationRepository(axios as NuxtAxiosInstance);
const mockVisit = jest.spyOn(reservationRepositoryInstance, 'visit')
  .mockImplementation((reservationId: number) => Promise.resolve());

/* courseRepositoryのインスタンスを作成、必要なメソッドをモック化 */
const courseRepositoryInstance: courseRepositoryInterface = new courseRepository(axios as NuxtAxiosInstance);
const mockRegisterCourse = jest.spyOn(courseRepositoryInstance, 'register')
  .mockImplementation((sendData: courseRequest) => Promise.resolve());
const mockDeleteCourse = jest.spyOn(courseRepositoryInstance, 'delete')
  .mockImplementation((id: number) => Promise.resolve());

/* window.alertをモック化 */
const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

/* window.confirmをモック化(chの値に応じて戻り値を切り替え) */
let ch: boolean;
const mockConfirm = jest.spyOn(window, 'confirm').mockImplementation(() => ch ? true : false);

/* テスト用のadminShopServiceインスタンスを作成 */
const testingAdminShopService = new adminShopService(shopRepositoryInstance, courseRepositoryInstance, reservationRepositoryInstance);

beforeEach(() => mockGetShopById.mockClear());

test('test updateShop', async () => {
  const newShop: newShop = {
    name: 'test',
    region_id: 100,
    genre_id: 100,
    description: 'test',
    base64EncodedImage: 'test',
  };

  const res = await testingAdminShopService.updateShop(100, newShop);
  
  expect(mockUpdateShop).toBeCalledWith(100, newShop);
  expect(mockGetShopById).toBeCalledWith(100);
  expect(mockAlert).toBeCalledWith('店舗情報が変更されました。');
  expect(res).toEqual(SHOP);
});

test('test registerCourse', async () => {
  const newCourse: newCourse = {
    name: 'test',
    price: 10000,
    description: 'test',
  };

  const res = await testingAdminShopService.registerCourse(100, newCourse);

  const expectedArg = {
    shop_id: 100,
    ...newCourse,
  };

  expect(mockRegisterCourse).toBeCalledWith(expectedArg);
  expect(mockGetShopById).toBeCalledWith(100);
  expect(mockAlert).toBeCalledWith('コースが正常に登録されました。');
  expect(res).toEqual([COURSE]);
});

describe('test deleteCourse', () => {
  const courseToDelete = {
    id: 200,
    name: 'test',
    price: 20000,
    description: 'test',
  }

  test('approve deletion', async () => {
    ch = true;

    const res = await testingAdminShopService.deleteCourse(100, 200, [COURSE, courseToDelete]);
    
    expect(mockDeleteCourse).toBeCalledWith(200);
    expect(mockGetShopById).toBeCalledWith(100);
    expect(res).toEqual([COURSE]);
  });

  test('cancel deletion', async () => {
    mockDeleteCourse.mockClear();
    mockGetShopById.mockClear();
    ch = false;

    const res = await testingAdminShopService.deleteCourse(100, 200, [COURSE, courseToDelete]);

    expect(mockDeleteCourse).not.toBeCalled();
    expect(mockGetShopById).not.toBeCalled();
    expect(res).toEqual([COURSE, courseToDelete]);
  });
});

test('test registerVisit', async () => {
  const decodedQRResult = '200,100'
  const reservationToUpdate = {  // HISTORYのvisit_completedを0としたもの
    ...HISTORY,
    visit_completed: 0,
  };

  const res = await testingAdminShopService.registerVisit(decodedQRResult, reservationToUpdate, 100);

  expect(mockVisit).toBeCalledWith(200);
  expect(mockGetShopByIdAsRepresentative).toBeCalledWith(100, 100);
  expect(mockAlert).toBeCalledWith('来店処理が完了しました。');
  expect(res).toEqual([
    [RESERVATION], 
    [HISTORY],
  ]);
});