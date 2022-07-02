import { reservation, sendData } from "~/types/api";
import { Stripe } from 'stripe';
import reservationRepositoryInterface from "~/repository/reservation/reservationRepositoryInterface";
import payServiceInterface from "./payServiceInterface";
import { payInitData } from "~/types/pageInitData";

export default class payService implements payServiceInterface {
  readonly reservationRepository: reservationRepositoryInterface;

  constructor(reservationRepository: reservationRepositoryInterface) {
    this.reservationRepository = reservationRepository;
  }

  async getData(reservationId: number): Promise<payInitData> {
    const data = {} as payInitData;
    try {
      data.reservation = await this.reservationRepository.getById(reservationId);
      data.amount = data.reservation.number * data.reservation.course.price;
      return data;
    } catch (error: any) {
      throw error;
    }
  };

  async pay(reservationId: number, token: Stripe.Token, amount: number): Promise<void> {
    const sendData: sendData = {
      amount: amount,
      source: token.id,
    }

    try {
      const successMessage: string = await this.reservationRepository.pay(reservationId, sendData);
      alert(`${successMessage}\n\nマイページに遷移します。`);
    } catch (error: any) {
      throw error;
    }
  };
}