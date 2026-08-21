package main

import "time"

func packageUnavailableReason(active bool, stock int, sellStart, sellEnd *time.Time, now time.Time) string {
	if !active {
		return "套餐已下架"
	}
	if stock == 0 {
		return "套餐已售罄"
	}
	if sellStart != nil && now.Before(*sellStart) {
		return "套餐暂未开售"
	}
	if sellEnd != nil && now.After(*sellEnd) {
		return "套餐已结束售卖"
	}
	return ""
}
