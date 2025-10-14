package com.pokeverse.play.quiz.dto;

public record MultiplayerPlayersInRoomDto(long id, long userId,String name,String avatar,int score){
    @Override
    public String toString() {
        return "MultiplayerPlayersInRoomDto{" +
                "id=" + id +
                ", userId=" + userId +
                ", name='" + name + '\'' +
                ", avatar='" + avatar + '\'' +
                ", score=" + score +
                '}';
    }
}